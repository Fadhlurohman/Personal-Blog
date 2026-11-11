export function getCleanSupabaseUrl(url: string | undefined): string {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}
