import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { ensureMediaDir, isSafeMediaSegment } from '@/lib/media';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB

function isMp4(file: File) {
  const name = file.name.toLowerCase();
  const extOk = name.endsWith('.mp4');
  const mimeOk =
    !file.type ||
    file.type === 'video/mp4' ||
    file.type === 'application/mp4' ||
    file.type === 'video/mpeg';
  return extOk && mimeOk;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!cookieStore.get('session')?.value) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Gagal membaca file upload.' }, { status: 400 });
  }

  const file = formData.get('file');
  const dramaId = Number(formData.get('dramaId'));
  const episodeNum = Number(formData.get('episode') || 0);

  if (!(file instanceof File)) {
    return Response.json({ error: 'File video wajib diunggah.' }, { status: 400 });
  }
  if (!dramaId) {
    return Response.json({ error: 'Drama wajib dipilih sebelum upload.' }, { status: 400 });
  }
  if (!isMp4(file)) {
    return Response.json({ error: 'Hanya file MP4 yang didukung.' }, { status: 400 });
  }
  if (file.size <= 0) {
    return Response.json({ error: 'File kosong.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'Ukuran file maksimal 500 MB.' }, { status: 400 });
  }

  const { data: drama, error } = await supabase
    .from('drama')
    .select('id, title, slug')
    .eq('id', dramaId)
    .single();

  if (error || !drama) {
    return Response.json({ error: 'Drama tidak ditemukan.' }, { status: 404 });
  }

  const folder = slugify(drama.slug || drama.title) || `drama-${drama.id}`;
  if (!isSafeMediaSegment(folder)) {
    return Response.json({ error: 'Nama folder drama tidak valid.' }, { status: 400 });
  }

  const stamp = Date.now();
  const rand = crypto.randomBytes(4).toString('hex');
  const epPart = episodeNum > 0 ? `ep${String(episodeNum).padStart(2, '0')}` : 'epxx';
  const fileName = `${epPart}-${stamp}-${rand}.mp4`;

  try {
    const dir = await ensureMediaDir(folder);
    const absolutePath = path.join(dir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, buffer);

    const url = `/api/media/${folder}/${fileName}`;
    return Response.json({
      url,
      fileName,
      folder,
      relativePath: `${folder}/${fileName}`,
      size: file.size,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan file.';
    return Response.json({ error: message }, { status: 500 });
  }
}
