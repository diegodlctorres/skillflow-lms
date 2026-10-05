-- Run once in a NEW Supabase project's SQL Editor, as the project administrator.
begin;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  content text not null default '',
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_name_valid check (
    name = btrim(name) and char_length(name) between 4 and 180
    and lower(right(name, 3)) = '.md'
    and position('/' in name) = 0 and position(chr(92) in name) = 0
    and name !~ '[[:cntrl:]]'
  ),
  constraint document_content_size check (octet_length(content) <= 2097152)
);
create unique index documents_owner_name on public.documents (owner_id, lower(name));

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  name text not null,
  content text not null,
  revision integer not null,
  created_at timestamptz not null default now(),
  unique (document_id, revision)
);

alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
create policy documents_read_own on public.documents for select to authenticated
  using (owner_id = (select auth.uid()));
create policy versions_read_own on public.document_versions for select to authenticated
  using (exists (
    select 1 from public.documents d where d.id = document_id and d.owner_id = (select auth.uid())
  ));

-- Mutations only through authenticated, owner-checked RPCs. No direct table writes.
revoke all on public.documents, public.document_versions from anon, authenticated;
grant select on public.documents, public.document_versions to authenticated;

create function public.capture_document_version() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.document_versions(document_id, name, content, revision, created_at)
  values (new.id, new.name, new.content, new.revision, new.updated_at);
  -- Bound history storage: retain the latest 20 snapshots per document.
  delete from public.document_versions
    where document_id = new.id and revision <= new.revision - 20;
  return new;
end;
$$;
create trigger document_version_after_write after insert or update on public.documents
  for each row execute function public.capture_document_version();

create function public.create_document(p_name text, p_content text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result public.documents;
begin
  if auth.uid() is null then raise sqlstate 'PT403' using message = 'Authentication required'; end if;
  insert into public.documents(owner_id, name, content)
    values (auth.uid(), p_name, p_content) returning * into result;
  return to_jsonb(result);
end;
$$;

create function public.save_document(p_id uuid, p_expected_revision integer, p_name text, p_content text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result public.documents;
begin
  if auth.uid() is null then raise sqlstate 'PT403' using message = 'Authentication required'; end if;
  select * into result from public.documents
    where id = p_id and owner_id = auth.uid() for update;
  if not found then raise sqlstate 'PT403' using message = 'Document not accessible'; end if;
  if p_expected_revision is null or result.revision <> p_expected_revision then
    raise sqlstate 'PT409' using message = 'Document changed since it was loaded';
  end if;
  if result.name = p_name and result.content = p_content then return to_jsonb(result); end if;
  update public.documents set name = p_name, content = p_content,
    revision = revision + 1, updated_at = clock_timestamp()
    where id = p_id returning * into result;
  return to_jsonb(result);
end;
$$;

create function public.import_documents(p_documents jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare item jsonb; inserted_count integer := 0; skipped_count integer := 0; affected integer;
begin
  if auth.uid() is null then raise sqlstate 'PT403' using message = 'Authentication required'; end if;
  if p_documents is null or jsonb_typeof(p_documents) <> 'array' then
    raise exception 'Expected a JSON array';
  end if;
  if jsonb_array_length(p_documents) > 50 then raise exception 'Import at most 50 files'; end if;
  for item in select value from jsonb_array_elements(p_documents) loop
    if jsonb_typeof(item->'name') is distinct from 'string'
      or jsonb_typeof(item->'content') is distinct from 'string' then
      raise exception 'Each document needs a name and content';
    end if;
    insert into public.documents(owner_id, name, content)
      values (auth.uid(), item->>'name', item->>'content')
      on conflict (owner_id, lower(name)) do nothing;
    get diagnostics affected = row_count;
    inserted_count := inserted_count + affected;
    skipped_count := skipped_count + (1 - affected);
  end loop;
  return jsonb_build_object('imported', inserted_count, 'skipped', skipped_count);
end;
$$;

revoke all on function public.capture_document_version() from public, anon, authenticated;
revoke all on function public.create_document(text, text) from public, anon;
revoke all on function public.save_document(uuid, integer, text, text) from public, anon;
revoke all on function public.import_documents(jsonb) from public, anon;
grant execute on function public.create_document(text, text) to authenticated;
grant execute on function public.save_document(uuid, integer, text, text) to authenticated;
grant execute on function public.import_documents(jsonb) to authenticated;

commit;
