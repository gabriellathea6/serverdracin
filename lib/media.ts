import { mkdir } from 'fs/promises';
import path from 'path';

export const MEDIA_ROOT = path.join(process.cwd(), 'app', 'media');

export function resolveMediaPath(...segments: string[]) {
  const resolved = path.resolve(MEDIA_ROOT, ...segments);
  if (!resolved.startsWith(MEDIA_ROOT)) {
    throw new Error('Path media tidak valid.');
  }
  return resolved;
}

export async function ensureMediaDir(folder: string) {
  const dir = resolveMediaPath(folder);
  await mkdir(dir, { recursive: true });
  return dir;
}

export function isSafeMediaSegment(segment: string) {
  return Boolean(segment) && !segment.includes('..') && !segment.includes('/') && !segment.includes('\\');
}
