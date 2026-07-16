import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { isSafeMediaSegment } from '@/lib/media';
import { getHlsDir, readRewrittenPlaylist } from '@/lib/transcode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ path: string[] }> };

function contentTypeFor(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (lower.endsWith('.ts')) return 'video/mp2t';
  return 'application/octet-stream';
}

export async function GET(_request: Request, { params }: RouteParams) {
  const segments = (await params).path ?? [];
  if (segments.length === 0 || segments.length > 2) {
    return Response.json({ error: 'Path tidak valid.' }, { status: 400 });
  }

  // /video/{name}.m3u8
  if (segments.length === 1) {
    const file = segments[0];
    if (!file.toLowerCase().endsWith('.m3u8')) {
      return Response.json({ error: 'Playlist tidak ditemukan.' }, { status: 404 });
    }

    const videoName = file.slice(0, -'.m3u8'.length);
    if (!isSafeMediaSegment(videoName)) {
      return Response.json({ error: 'Nama video tidak valid.' }, { status: 400 });
    }

    try {
      const body = await readRewrittenPlaylist(videoName);
      return new Response(body, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'public, max-age=60',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch {
      return Response.json({ error: 'Playlist tidak ditemukan.' }, { status: 404 });
    }
  }

  // /video/{name}/{seg_xxx.ts}
  const [videoName, segmentFile] = segments;
  if (!isSafeMediaSegment(videoName) || !isSafeMediaSegment(segmentFile)) {
    return Response.json({ error: 'Path tidak aman.' }, { status: 400 });
  }
  if (!segmentFile.toLowerCase().endsWith('.ts')) {
    return Response.json({ error: 'Segment tidak ditemukan.' }, { status: 404 });
  }

  try {
    const absolutePath = path.join(getHlsDir(videoName), segmentFile);
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      return Response.json({ error: 'Segment tidak ditemukan.' }, { status: 404 });
    }

    const nodeStream = createReadStream(absolutePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new Response(webStream, {
      headers: {
        'Content-Type': contentTypeFor(segmentFile),
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return Response.json({ error: 'Segment tidak ditemukan.' }, { status: 404 });
  }
}
