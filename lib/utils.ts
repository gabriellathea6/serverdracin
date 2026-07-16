export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function maskSecret(value: string, visible = 6): string {
  if (!value) return '-';
  if (value.length <= visible) return '••••••••';
  return `${value.slice(0, visible)}${'•'.repeat(8)}`;
}
