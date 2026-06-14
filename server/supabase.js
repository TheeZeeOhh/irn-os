import { createClient } from '@supabase/supabase-js';
import { readConfig } from './config.js';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const config = readConfig();
  const { url, key } = config.supabase || {};

  if (!url || !key) {
    return null; // not configured yet
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

export async function uploadFileToSupabase(fileBuffer, fileName, mimeType) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client is not configured. Add credentials in Key Manager.');
  }

  const config = readConfig();
  const bucketName = config.supabase.bucket || 'irn-os-uploads';

  // Upload file to bucket
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return {
    path: data.path,
    publicUrl: urlData.publicUrl
  };
}

export async function listSupabaseFiles() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const config = readConfig();
  const bucketName = config.supabase.bucket || 'irn-os-uploads';

  const { data, error } = await supabase.storage
    .from(bucketName)
    .list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('Error listing files:', error);
    return [];
  }

  return data.map(f => {
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(f.name);
      
    return {
      name: f.name,
      id: f.id,
      metadata: f.metadata,
      publicUrl: urlData.publicUrl,
      created_at: f.created_at
    };
  });
}
