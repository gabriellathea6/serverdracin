'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { ActionState } from '@/lib/types';

function isValidEpisodeVideoUrl(url: string) {
  if (url.startsWith('/video/') && url.endsWith('.m3u8')) return true;

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    return path.startsWith('/video/') && path.endsWith('.m3u8');
  } catch {
    return false;
  }
}

async function syncDramaTotalEpisode(dramaId: number) {
  if (!dramaId) return;

  const { count, error: countError } = await supabase
    .from('episode')
    .select('*', { count: 'exact', head: true })
    .eq('id_drama', dramaId);

  if (countError) return;

  await supabase
    .from('drama')
    .update({ total_episode: count ?? 0 })
    .eq('id', dramaId);
}

export async function getNextEpisodeNumber(dramaId: number): Promise<number> {
  if (!dramaId) return 1;

  const { data, error } = await supabase
    .from('episode')
    .select('episode')
    .eq('id_drama', dramaId)
    .order('episode', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.episode) return 1;
  return Number(data.episode) + 1;
}

export async function createEpisodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id_drama = Number(formData.get('id_drama'));
  const episode = Number(formData.get('episode'));
  const url = String(formData.get('url') || '').trim();

  if (!id_drama) return { error: 'Drama wajib dipilih.' };
  if (!episode || episode < 1) return { error: 'Nomor episode wajib diisi.' };
  if (!url) return { error: 'File video episode wajib diunggah & ditranscode.' };
  if (!isValidEpisodeVideoUrl(url)) {
    return { error: 'URL video tidak valid. Upload & transcode ulang ke format m3u8.' };
  }

  const { error } = await supabase.from('episode').insert([{ id_drama, episode, url }]);
  if (error) return { error: error.message || 'Gagal menambah episode.' };

  await syncDramaTotalEpisode(id_drama);

  const returnTo = String(formData.get('return_to') || '').trim();
  const safeReturn =
    returnTo.startsWith('/aplikasi/') ? returnTo : '/aplikasi/episode';

  revalidatePath('/aplikasi/episode');
  revalidatePath('/aplikasi/drama');
  redirect(safeReturn);
}

export async function updateEpisodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get('id'));
  const id_drama = Number(formData.get('id_drama'));
  const episode = Number(formData.get('episode'));
  const url = String(formData.get('url') || '').trim();

  if (!id) return { error: 'ID tidak valid.' };
  if (!id_drama) return { error: 'Drama wajib dipilih.' };
  if (!episode || episode < 1) return { error: 'Nomor episode wajib diisi.' };
  if (!url) return { error: 'File video episode wajib diunggah & ditranscode.' };
  if (!isValidEpisodeVideoUrl(url)) {
    return { error: 'URL video tidak valid. Upload & transcode ulang ke format m3u8.' };
  }

  const { data: existing } = await supabase
    .from('episode')
    .select('id_drama')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('episode')
    .update({ id_drama, episode, url })
    .eq('id', id);

  if (error) return { error: error.message || 'Gagal memperbarui episode.' };

  await syncDramaTotalEpisode(id_drama);
  if (existing?.id_drama && existing.id_drama !== id_drama) {
    await syncDramaTotalEpisode(existing.id_drama);
  }

  revalidatePath('/aplikasi/episode');
  revalidatePath('/aplikasi/drama');
  redirect('/aplikasi/episode');
}

export async function deleteEpisodeAction(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!id) return;

  const { data: existing } = await supabase
    .from('episode')
    .select('id_drama')
    .eq('id', id)
    .single();

  await supabase.from('episode').delete().eq('id', id);

  if (existing?.id_drama) {
    await syncDramaTotalEpisode(existing.id_drama);
  }

  revalidatePath('/aplikasi/episode');
  revalidatePath('/aplikasi/drama');
}
