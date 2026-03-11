import { NextResponse } from 'next/server';
import axios from 'axios';
import { validateProxyImageUrl } from '../../../lib/server/urlGuards';

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const rawUrl = reqUrl.searchParams.get('url');

  if (!rawUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  const parsedUrl = validateProxyImageUrl(rawUrl);
  if (!parsedUrl) {
    return new NextResponse('Unsupported image URL', { status: 400 });
  }

  try {
    const response = await axios.get<ArrayBuffer>(parsedUrl.href, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': 'https://mp.weixin.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Unsupported content type', { status: 415 });
    }

    const buffer = response.data;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
