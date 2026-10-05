// Real PostgreSQL engine in memory. No Supabase account or credentials required.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
let passed = 0;
async function check(name, run) {
  await run(); passed++; console.log(`PASS ${name}`);
}
async function asUser(id, role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id || '']);
  await db.exec(`set role ${role}`);
}
async function create(name, content = '') {
  return (await db.query('select to_jsonb(public.create_document($1, $2)) as doc', [name, content])).rows[0].doc;
}
async function save(doc, name, content, revision = doc.revision) {
  return (await db.query('select to_jsonb(public.save_document($1, $2, $3, $4)) as doc', [doc.id, revision, name, content])).rows[0].doc;
}
async function importBatch(documents) {
  return (await db.query('select public.import_documents($1::jsonb) as result', [JSON.stringify(documents)])).rows[0].result;
}
const denied = (run, code) => assert.rejects(run, error => error.code === code);

try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${alice}'), ('${bob}');
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/001_document_library.sql', import.meta.url), 'utf8'));
  await asUser(null, 'anon');
  await check('anonymous cannot read documents', () => denied(() => db.query('select * from public.documents'), '42501'));
  await check('anonymous cannot create documents', () => denied(() => create('anon.md'), '42501'));
  await asUser(null);
  await check('RPC rejects missing authenticated identity', () => denied(() => create('anonymous.md'), 'PT403'));
  await asUser(alice);
  let document;
  const original = '\ufeff# Texto\r\n\r\nñ y á\r\n';
  await check('create preserves original text and creates first snapshot', async () => {
    document = await create('original.md', original);
    assert.equal(document.owner_id, alice); assert.equal(document.content, original); assert.equal(document.revision, 1);
    const rows = (await db.query('select to_jsonb(v) as snapshot from public.document_versions v')).rows;
    assert.equal(rows.length, 1); assert.equal(rows[0].snapshot.content, original);
  });
  await check('case-insensitive duplicate names rejected', () => denied(() => create('ORIGINAL.MD'), '23505'));
  await check('direct writes cannot bypass revision logic', () => denied(() => db.query("update public.documents set content = 'bypass'"), '42501'));
  await check('history cannot be rewritten by a client', () => denied(() => db.query('delete from public.document_versions'), '42501'));
  await check('filename and size constraints enforced in database', async () => {
    for (const name of ['../a.md', 'a\\b.md', '.md', 'x.txt', 'a\n.md']) await denied(() => create(name), '23514');
    await denied(() => create('huge.md', 'á'.repeat(1048577)), '23514');
  });
  await asUser(bob);
  await check('second account cannot read first account or its history', async () => {
    assert.equal((await db.query('select * from public.documents')).rows.length, 0);
    assert.equal((await db.query('select * from public.document_versions')).rows.length, 0);
  });
  await check('second account cannot save first account document by UUID', () => denied(() => save(document, 'stolen.md', 'no'), 'PT403'));
  await check('same filename allowed in separate libraries', async () => assert.equal((await create('original.md', 'bob')).owner_id, bob));
  await asUser(alice);
  await check('save increments version and stale writes fail', async () => {
    const stale = document;
    document = await save(document, document.name, '# Changed');
    assert.equal(document.revision, 2);
    await denied(() => save(stale, stale.name, '# Lost update'), 'PT409');
    await denied(() => save(document, document.name, 'bypass', null), 'PT409');
  });
  await check('no-op saves do not waste history storage', async () => {
    const saved = await save(document, document.name, document.content);
    assert.equal(saved.revision, document.revision);
  });
  await check('restore is a new revision retaining original text', async () => {
    document = await save(document, 'restored.md', original);
    assert.equal(document.revision, 3); assert.equal(document.content, original);
  });
  await check('repeat imports skip existing names without overwriting', async () => {
    const result = await importBatch([{ name: 'RESTORED.MD', content: 'overwrite' }, { name: 'imported.md', content: original }]);
    assert.deepEqual(result, { imported: 1, skipped: 1 });
    assert.deepEqual(await importBatch([{ name: 'IMPORTED.MD', content: 'overwrite' }]), { imported: 0, skipped: 1 });
    assert.equal((await db.query("select encode(convert_to(content, 'UTF8'), 'hex') as hex from public.documents where id = $1", [document.id])).rows[0].hex, Buffer.from(original, 'utf8').toString('hex'));
  });
  await check('invalid import rolls back every file in the batch', async () => {
    await denied(() => importBatch([{ name: 'rollback.md', content: 'ok' }, { name: '../invalid.md', content: 'bad' }]), '23514');
    assert.equal((await db.query("select * from public.documents where name = 'rollback.md'")).rows.length, 0);
    await assert.rejects(() => importBatch([{ name: 'missing.md' }]));
    await assert.rejects(() => importBatch(Array.from({ length: 51 }, () => ({ name: 'n.md', content: '' }))));
  });
  await check('last 20 history snapshots retained', async () => {
    for (let i = 0; i < 23; i++) document = await save(document, document.name, `Version ${i}`);
    const rows = (await db.query('select revision from public.document_versions where document_id = $1 order by revision', [document.id])).rows;
    assert.equal(rows.length, 20); assert.equal(rows[19].revision, document.revision);
    assert.equal(rows[0].revision, document.revision - 19);
  });
  // Use the actual source folder, without writing or bundling its files.
  await check('all 13 original files round-trip through PostgreSQL', async () => {
    const { readdir } = await import('node:fs/promises');
    const directory = new URL('../sq-regulatorios-contabilidad/', import.meta.url);
    const names = (await readdir(directory)).filter(name => name.endsWith('.md'));
    const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
    const input = await Promise.all(names.map(async name => ({ name, content: decoder.decode(await readFile(new URL(name, directory))) })));
    const result = await importBatch(input);
    assert.equal(result.imported, names.length);
    for (const source of input) {
      const saved = (await db.query("select encode(convert_to(content, 'UTF8'), 'hex') as hex from public.documents where name = $1", [source.name])).rows[0].hex;
      assert.equal(saved, Buffer.from(source.content, 'utf8').toString('hex'));
    }
  });
  console.log(`\n${passed} database checks passed. Auth schema/roles simulated; PostgreSQL tables, RPCs, triggers and RLS are real.`);
} finally { await db.close(); }
