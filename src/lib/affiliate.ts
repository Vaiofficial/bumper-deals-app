/**
 * Utility to inject an Amazon Associates affiliate tag into any Amazon URL.
 * Reads NEXT_PUBLIC_AMAZON_AFFILIATE_TAG from environment variables or falls back to custom tag.
 */
export function injectAffiliateTag(url: string, customTag?: string): string {
  if (!url) return url;

  const tag = customTag || process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || '';
  if (!tag.trim()) {
    return url;
  }

  try {
    const parsed = new URL(url);
    // Only inject for amazon domains
    if (parsed.hostname.includes('amazon.')) {
      parsed.searchParams.set('tag', tag.trim());
      // Clean up common tracking clutter while keeping essential referral parameters
      parsed.searchParams.delete('pf_rd_r');
      parsed.searchParams.delete('pf_rd_p');
      parsed.searchParams.delete('pd_rd_r');
      parsed.searchParams.delete('pd_rd_w');
      parsed.searchParams.delete('pd_rd_wg');
      return parsed.toString();
    }
    return url;
  } catch (e) {
    // Fallback if URL parsing fails
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=${encodeURIComponent(tag.trim())}`;
  }
}
