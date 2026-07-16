'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { ActionState } from '@/lib/types';

export async function createImagekitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get('name') || '').trim();
  const public_key = String(formData.get('public_key') || '').trim();
  const private_key = String(formData.get('private_key') || '').trim();
  const endpoint_url = String(formData.get('endpoint_url') || '').trim();

  if (!name) return { error: 'Nama API wajib diisi.' };
  if (!public_key) return { error: 'Public key wajib diisi.' };
  if (!private_key) return { error: 'Private key wajib diisi.' };
  if (!endpoint_url) return { error: 'Endpoint URL wajib diisi.' };

  const { error } = await supabase.from('imagekit_api').insert([{
    name,
    public_key,
    private_key,
    endpoint_url,
  }]);

  if (error) return { error: error.message || 'Gagal menambah ImageKit API.' };

  revalidatePath('/aplikasi/imgakit-api');
  redirect('/aplikasi/imgakit-api');
}

export async function updateImagekitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get('id'));
  const name = String(formData.get('name') || '').trim();
  const public_key = String(formData.get('public_key') || '').trim();
  const private_key = String(formData.get('private_key') || '').trim();
  const endpoint_url = String(formData.get('endpoint_url') || '').trim();

  if (!id) return { error: 'ID tidak valid.' };
  if (!name) return { error: 'Nama API wajib diisi.' };
  if (!public_key) return { error: 'Public key wajib diisi.' };
  if (!private_key) return { error: 'Private key wajib diisi.' };
  if (!endpoint_url) return { error: 'Endpoint URL wajib diisi.' };

  const { error } = await supabase
    .from('imagekit_api')
    .update({ name, public_key, private_key, endpoint_url })
    .eq('id', id);

  if (error) return { error: error.message || 'Gagal memperbarui ImageKit API.' };

  revalidatePath('/aplikasi/imgakit-api');
  redirect('/aplikasi/imgakit-api');
}

export async function deleteImagekitAction(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!id) return;

  await supabase.from('imagekit_api').delete().eq('id', id);
  revalidatePath('/aplikasi/imgakit-api');
}
