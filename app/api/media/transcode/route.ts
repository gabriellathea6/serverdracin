import { unlink } from 'fs/promises';
import { cookies } from 'next/headers';
import {
  buildPrettyVideoUrl,
  resolveUploadedMp4Absolute,
  transcodeToHls,
  writePrettyPlaylistAlias,
} from '@/lib/transcode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!cookieStore.get('session')?.value) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { relativePath?: string; baseUrl?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const relativePath = String(body.relativePath || '').trim();
  if (!relativePath) {
    return Response.json({ error: 'relativePath wajib diisi.' }, { status: 400 });
  }

  const requestOrigin = new URL(request.url).origin;
  const baseUrl = String(
    body.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || requestOrigin,
  ).replace(/\/$/, '');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      void (async () => {
        let inputAbsolutePath = '';

        try {
          send({ type: 'status', message: 'Menyiapkan transcoder lokal...' });
          inputAbsolutePath = resolveUploadedMp4Absolute(relativePath);

          send({ type: 'status', message: 'Transcoding ke HLS lokal...' });
          const result = await transcodeToHls({
            inputAbsolutePath,
            onProgress: (progress) => {
              send({
                type: 'progress',
                phase: 'transcode',
                percent: progress.percent,
              });
            },
          });

          await writePrettyPlaylistAlias(result.videoName);

          // Hapus MP4 sumber hanya setelah output HLS selesai dibuat.
          try {
            await unlink(inputAbsolutePath);
            inputAbsolutePath = '';
            send({ type: 'status', message: 'MP4 lokal dihapus.' });
          } catch {
            send({ type: 'status', message: 'Gagal menghapus MP4 lokal.' });
          }

          const url = buildPrettyVideoUrl(baseUrl, result.videoName);

          send({
            type: 'done',
            url,
            videoName: result.videoName,
            percent: 100,
          });
          controller.close();
        } catch (err) {
          // Best-effort cleanup of leftovers on failure after partial work
          if (inputAbsolutePath) {
            try {
              await unlink(inputAbsolutePath);
            } catch {
              // ignore
            }
          }

          const message = err instanceof Error ? err.message : 'Transcode gagal.';
          send({ type: 'error', error: message });
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
