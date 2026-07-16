'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { ActionState } from '@/lib/types';
import { slugify } from '@/lib/utils';

export async function createDramaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id_provider_drama = Number(formData.get('id_provider_drama'));
  const title = String(formData.get('title') || '').trim();
  let slug = String(formData.get('slug') || '').trim();
  const deskripsi = String(formData.get('deskripsi') || '').trim() || null;
  const total_episode = Number(formData.get('total_episode') || 0);
  const cover_imagekit_url = String(formData.get('cover_imagekit_url') || '').trim() || null;

  if (!id_provider_drama) return { error: 'Provider wajib dipilih.' };
  if (!title) return { error: 'Judul drama wajib diisi.' };
  if (!slug) slug = slugify(title);
  if (!slug) return { error: 'Slug tidak valid.' };
  if (Number.isNaN(total_episode) || total_episode < 0) {
    return { error: 'Total episode tidak valid.' };
  }

  const { error } = await supabase.from('drama').insert([{
    id_provider_drama,
    title,
    slug,
    deskripsi,
    total_episode,
    cover_imagekit_url,
  }]);

  if (error) {
    if (error.code === '23505') return { error: 'Slug sudah digunakan.' };
    return { error: error.message || 'Gagal menambah drama.' };
  }

  revalidatePath('/aplikasi/drama');
  revalidatePath('/aplikasi/episode');
  redirect('/aplikasi/drama');
}

export async function updateDramaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get('id'));
  const id_provider_drama = Number(formData.get('id_provider_drama'));
  const title = String(formData.get('title') || '').trim();
  let slug = String(formData.get('slug') || '').trim();
  const deskripsi = String(formData.get('deskripsi') || '').trim() || null;
  const total_episode = Number(formData.get('total_episode') || 0);
  const cover_imagekit_url = String(formData.get('cover_imagekit_url') || '').trim() || null;

  if (!id) return { error: 'ID tidak valid.' };
  if (!id_provider_drama) return { error: 'Provider wajib dipilih.' };
  if (!title) return { error: 'Judul drama wajib diisi.' };
  if (!slug) slug = slugify(title);
  if (Number.isNaN(total_episode) || total_episode < 0) {
    return { error: 'Total episode tidak valid.' };
  }

  const { error } = await supabase
    .from('drama')
    .update({
      id_provider_drama,
      title,
      slug,
      deskripsi,
      total_episode,
      cover_imagekit_url,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') return { error: 'Slug sudah digunakan.' };
    return { error: error.message || 'Gagal memperbarui drama.' };
  }

  revalidatePath('/aplikasi/drama');
  revalidatePath('/aplikasi/episode');
  redirect('/aplikasi/drama');
}

export async function deleteDramaAction(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!id) return;

  await supabase.from('drama').delete().eq('id', id);
  revalidatePath('/aplikasi/drama');
  revalidatePath('/aplikasi/episode');
}
