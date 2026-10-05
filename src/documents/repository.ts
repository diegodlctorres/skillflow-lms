import { supabase } from '../infrastructure/supabase';
import type { DocumentVersion, MarkdownDocument } from './model';

function client() {
  if (!supabase) throw new Error('Configura Supabase antes de continuar.');
  return supabase;
}

export async function listDocuments(): Promise<MarkdownDocument[]> {
  // Range pagination avoids silently dropping documents at PostgREST's row cap.
  const documents: MarkdownDocument[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client().from('documents').select('*').order('name').order('id').range(offset, offset + 99);
    if (error) throw error;
    documents.push(...data as MarkdownDocument[]);
    if (data.length < 100) return documents;
  }
}

export async function createDocument(name: string, content: string): Promise<MarkdownDocument> {
  const { data, error } = await client().rpc('create_document', { p_name: name, p_content: content });
  if (error) throw error;
  return data as MarkdownDocument;
}

export async function saveDocument(document: MarkdownDocument, name: string, content: string): Promise<MarkdownDocument> {
  const { data, error } = await client().rpc('save_document', {
    p_id: document.id, p_expected_revision: document.revision, p_name: name, p_content: content,
  });
  if (error) throw error;
  return data as MarkdownDocument;
}

export async function importDocuments(documents: { name: string; content: string }[]): Promise<{ imported: number; skipped: number }> {
  const { data, error } = await client().rpc('import_documents', { p_documents: documents });
  if (error) throw error;
  return data as { imported: number; skipped: number };
}

export async function listVersions(id: string): Promise<Omit<DocumentVersion, 'content'>[]> {
  const { data, error } = await client().from('document_versions')
    .select('id,document_id,name,revision,created_at').eq('document_id', id).order('revision', { ascending: false }).limit(100);
  if (error) throw error;
  return data as Omit<DocumentVersion, 'content'>[];
}

export async function getVersion(id: string): Promise<DocumentVersion> {
  const { data, error } = await client().from('document_versions').select('*').eq('id', id).single();
  if (error) throw error;
  return data as DocumentVersion;
}
