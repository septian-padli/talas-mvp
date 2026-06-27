/**
 * Utility for formatting media object storage paths into full public URLs.
 * Automatically prepends R2_PUBLIC_DOMAIN if the path is relative.
 */
export function formatMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // If already an absolute URL (e.g. Google OAuth photo or external HTTP link), return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const publicDomain = process.env.R2_PUBLIC_DOMAIN || "http://localhost:9090/talas-media";
  const cleanDomain = publicDomain.endsWith("/") ? publicDomain.slice(0, -1) : publicDomain;
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;

  return `${cleanDomain}/${cleanPath}`;
}
