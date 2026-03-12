const WECHAT_IMAGE_HOSTS = [
  'mmbiz.qpic.cn',
  'mmbiz.qlogo.cn',
  'res.wx.qq.com',
  'wx.qlogo.cn',
  'mp.weixin.qq.com',
] as const;

const CLOUDINARY_IMAGE_HOSTS = [
  'res.cloudinary.com',
] as const;

const ALLOWED_PROXY_IMAGE_HOSTS = new Set<string>([
  ...WECHAT_IMAGE_HOSTS,
  ...CLOUDINARY_IMAGE_HOSTS,
]);

export function parseHttpsUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

export function isAllowedProxyImageHost(hostname: string): boolean {
  return ALLOWED_PROXY_IMAGE_HOSTS.has(hostname.toLowerCase());
}

export function getProxyImageSrc(rawUrl: string | null | undefined): string | null {
  const trimmedUrl = rawUrl?.trim();
  if (!trimmedUrl) {
    return null;
  }

  if (trimmedUrl.startsWith('data:image/')) {
    return trimmedUrl;
  }

  const parsed = parseHttpsUrl(trimmedUrl);
  if (!parsed || !isAllowedProxyImageHost(parsed.hostname)) {
    return null;
  }

  return `/api/proxy-image?url=${encodeURIComponent(parsed.href)}`;
}

export { CLOUDINARY_IMAGE_HOSTS, WECHAT_IMAGE_HOSTS };
