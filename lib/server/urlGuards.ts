const WECHAT_ARTICLE_HOSTS = new Set([
  'mp.weixin.qq.com',
]);

const WECHAT_IMAGE_HOSTS = new Set([
  'mmbiz.qpic.cn',
  'mmbiz.qlogo.cn',
  'res.wx.qq.com',
  'wx.qlogo.cn',
  'mp.weixin.qq.com',
]);

const CLOUDINARY_IMAGE_HOSTS = new Set([
  'res.cloudinary.com',
]);

const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
]);

function isIpv4(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

function isPrivateIpv4(hostname: string): boolean {
  if (!isIpv4(hostname)) return false;
  const [a, b] = hostname.split('.').map(Number);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function parseHttpsUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

export function validateWeChatArticleUrl(rawUrl: string): URL | null {
  const parsed = parseHttpsUrl(rawUrl);
  if (!parsed) return null;
  return WECHAT_ARTICLE_HOSTS.has(parsed.hostname) ? parsed : null;
}

export function validateProxyImageUrl(rawUrl: string): URL | null {
  const parsed = parseHttpsUrl(rawUrl);
  if (!parsed) return null;

  const hostname = parsed.hostname.toLowerCase();
  if (LOCAL_HOSTS.has(hostname) || isPrivateIpv4(hostname)) {
    return null;
  }

  if (WECHAT_IMAGE_HOSTS.has(hostname) || CLOUDINARY_IMAGE_HOSTS.has(hostname)) {
    return parsed;
  }

  return null;
}
