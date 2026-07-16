'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { ActionState } from '@/lib/types';
import { slugify } from '@/lib/utils';

export async function createProviderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get('name') || '').trim();
  let slug = String(formData.get('slug') || '').trim();

  if (!name) return { error: 'Nama provider wajib diisi.' };
  if (!slug) slug = slugify(name);
  if (!slug) return { error: 'Slug tidak valid.' };

  const { error } = await supabase.from('provider_drama').insert([{ name, slug }]);
  if (error) {
    if (error.code === '23505') return { error: 'Slug sudah digunakan.' };
    return { error: error.message || 'Gagal menambah provider.' };
  }

  revalidatePath('/aplikasi/provider');
  redirect('/aplikasi/provider');
}

export async function updateProviderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get('id'));
  const name = String(formData.get('name') || '').trim();
  let slug = String(formData.get('slug') || '').trim();

  if (!id) return { error: 'ID tidak valid.' };
  if (!name) return { error: 'Nama provider wajib diisi.' };
  if (!slug) slug = slugify(name);

  const { error } = await supabase
    .from('provider_drama')
    .update({ name, slug })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') return { error: 'Slug sudah digunakan.' };
    return { error: error.message || 'Gagal memperbarui provider.' };
  }

  revalidatePath('/aplikasi/provider');
  redirect('/aplikasi/provider');
}

export async function deleteProviderAction(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!id) return;

  await supabase.from('provider_drama').delete().eq('id', id);
  revalidatePath('/aplikasi/provider');
  revalidatePath('/aplikasi/drama');
}
