import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { isSafeMediaSegment, resolveMediaPath } from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const segments = (await params).path ?? [];

  if (segments.length < 2) {
    return Response.json({ error: 'Path tidak valid.' }, { status: 400 });
  }

  if (!segments.every(isSafeMediaSegment)) {
    return Response.json({ error: 'Path tidak aman.' }, { status: 400 });
  }

  const fileName = segments[segments.length - 1];
  if (!fileName.toLowerCase().endsWith('.mp4')) {
    return Response.json({ error: 'File tidak ditemukan.' }, { status: 404 });
  }

  try {
    const absolutePath = resolveMediaPath(...segments);
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      return Response.json({ error: 'File tidak ditemukan.' }, { status: 404 });
    }

    const nodeStream = createReadStream(absolutePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new Response(webStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(info.size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${path.basename(absolutePath)}"`,
      },
    });
  } catch {
    return Response.json({ error: 'File tidak ditemukan.' }, { status: 404 });
  }
}
