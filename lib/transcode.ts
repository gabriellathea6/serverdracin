import { spawn } from 'child_process';
import crypto from 'crypto';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { MEDIA_ROOT, resolveMediaPath } from '@/lib/media';

export const FFMPEG_PATH = process.env.FFMPEG_PATH || 'D:\\nextjs\\transcoder\\ffmpeg.exe';
export const FFPROBE_PATH = process.env.FFPROBE_PATH || 'D:\\nextjs\\transcoder\\ffprobe.exe';

export function generateVideoName() {
  return crypto.randomBytes(12).toString('hex');
}

export function getHlsDir(name: string) {
  return resolveMediaPath('hls', name);
}

export async function ensureFfmpegExists() {
  await access(FFMPEG_PATH);
}

function runProcess(
  bin: string,
  args: string[],
  onStdout?: (chunk: string) => void,
  onStderr?: (chunk: string) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(bin, args, { windowsHide: true });

    child.stdout.on('data', (buf: Buffer) => onStdout?.(buf.toString('utf8')));
    child.stderr.on('data', (buf: Buffer) => onStderr?.(buf.toString('utf8')));

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Proses gagal (exit ${code}).`));
    });
  });
}

export async function probeDurationSeconds(inputPath: string): Promise<number> {
  try {
    let output = '';
    await runProcess(
      FFPROBE_PATH,
      [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        inputPath,
      ],
      (chunk) => {
        output += chunk;
      },
    );
    const value = Number.parseFloat(output.trim());
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export type TranscodeProgress = {
  percent: number;
  outTimeMs: number;
  durationMs: number;
};

function toFfmpegPath(p: string) {
  return p.replace(/\\/g, '/');
}

export async function transcodeToHls(options: {
  inputAbsolutePath: string;
  videoName?: string;
  onProgress?: (progress: TranscodeProgress) => void;
}) {
  await ensureFfmpegExists();

  const videoName = options.videoName || generateVideoName();
  const outDir = getHlsDir(videoName);
  await mkdir(outDir, { recursive: true });

  const playlistPath = path.join(outDir, 'index.m3u8');
  const segmentPattern = path.join(outDir, 'seg_%03d.ts');
  const durationSec = await probeDurationSeconds(options.inputAbsolutePath);
  const durationMs = durationSec * 1000;

  let lastPercent = 0;

  await runProcess(
    FFMPEG_PATH,
    [
      '-y',
      '-i', toFfmpegPath(options.inputAbsolutePath),
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-ar', '44100',
      '-hls_time', '6',
      '-hls_playlist_type', 'vod',
      '-hls_segment_filename', toFfmpegPath(segmentPattern),
      '-progress', 'pipe:1',
      '-nostats',
      toFfmpegPath(playlistPath),
    ],
    (chunk) => {
      if (!options.onProgress) return;
      const lines = chunk.split(/\r?\n/);
      let outTimeMs = 0;
      for (const line of lines) {
        if (line.startsWith('out_time_ms=')) {
          outTimeMs = Number(line.slice('out_time_ms='.length)) || 0;
        }
      }
      if (outTimeMs <= 0) return;
      const percent =
        durationMs > 0
          ? Math.min(99, Math.round((outTimeMs / durationMs) * 100))
          : Math.min(99, lastPercent + 1);
      if (percent !== lastPercent) {
        lastPercent = percent;
        options.onProgress({ percent, outTimeMs, durationMs });
      }
    },
  );

  options.onProgress?.({ percent: 100, outTimeMs: durationMs, durationMs });

  return {
    videoName,
    playlistPath,
    outDir,
  };
}

export async function readRewrittenPlaylist(videoName: string) {
  const playlistPath = path.join(getHlsDir(videoName), 'index.m3u8');
  const raw = await readFile(playlistPath, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      if (trimmed.endsWith('.ts')) {
        const file = path.posix.basename(trimmed.replace(/\\/g, '/'));
        return `/video/${videoName}/${file}`;
      }
      return line;
    })
    .join('\n');
}

export async function writePrettyPlaylistAlias(videoName: string) {
  // Keep a marker file so we know this stream exists
  const marker = path.join(getHlsDir(videoName), 'ready.json');
  await writeFile(
    marker,
    JSON.stringify({
      name: videoName,
      createdAt: new Date().toISOString(),
      playlist: `index.m3u8`,
    }),
    'utf8',
  );
}

export function buildPrettyVideoUrl(baseUrl: string, videoName: string) {
  const origin = baseUrl.replace(/\/$/, '');
  return `${origin}/video/${videoName}.m3u8`;
}

export function resolveUploadedMp4Absolute(relativePath: string) {
  const parts = relativePath.split('/').filter(Boolean);
  if (parts.length < 2) throw new Error('Path upload tidak valid.');
  if (parts.some((p) => p.includes('..'))) throw new Error('Path upload tidak aman.');
  const absolute = resolveMediaPath(...parts);
  if (!absolute.startsWith(MEDIA_ROOT)) throw new Error('Path upload di luar media root.');
  if (!absolute.toLowerCase().endsWith('.mp4')) throw new Error('File sumber harus MP4.');
  return absolute;
}
