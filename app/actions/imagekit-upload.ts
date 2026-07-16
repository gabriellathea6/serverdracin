'use server';

import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export type ImagekitAuthResult =
  | {
      ok: true;
      publicKey: string;
      signature: string;
      expire: number;
      token: string;
      urlEndpoint: string;
      name: string;
    }
  | { ok: false; error: string };

export async function getImagekitAuthAction(imagekitId: number): Promise<ImagekitAuthResult> {
  if (!imagekitId) {
    return { ok: false, error: 'Pilih akun ImageKit API terlebih dahulu.' };
  }

  const { data, error } = await supabase
    .from('imagekit_api')
    .select('id, name, public_key, private_key, endpoint_url')
    .eq('id', imagekitId)
    .single();

  if (error || !data) {
    return { ok: false, error: 'Konfigurasi ImageKit tidak ditemukan.' };
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 30; // 30 menit
  const signature = crypto
    .createHmac('sha1', data.private_key)
    .update(token + String(expire))
    .digest('hex');

  return {
    ok: true,
    publicKey: data.public_key,
    signature,
    expire,
    token,
    urlEndpoint: data.endpoint_url,
    name: data.name,
  };
}

export type ImagekitOption = {
  id: number;
  name: string;
};

export async function listImagekitOptions(): Promise<ImagekitOption[]> {
  const { data } = await supabase
    .from('imagekit_api')
    .select('id, name')
    .order('name', { ascending: true });

  return (data ?? []) as ImagekitOption[];
}
