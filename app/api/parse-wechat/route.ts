import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

export async function POST(request: Request) {
  let step = 'INIT';
  let debugUrl = '';

  try {
    step = 'PARSE_BODY';
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: '请求体 JSON 格式无效。' }, { status: 400 });
    }
    
    let { url } = body;

    if (!url) {
      return NextResponse.json({ error: '链接地址不能为空。' }, { status: 400 });
    }

    step = 'SANITIZE_URL';
    if (typeof url === 'string') {
      // Remove all whitespace/newlines
      url = url.replace(/\s/g, '');
    } else {
       return NextResponse.json({ error: '链接地址必须是字符串。' }, { status: 400 });
    }

    // Protocol Auto-Correction
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    step = 'VALIDATE_URL_OBJECT';
    // Validate URL object construction specifically
    try {
      const parsedUrl = new URL(url);
      url = parsedUrl.href; 
      debugUrl = url;
    } catch (e) {
      return NextResponse.json({ error: `链接格式无效："${url}"，请检查是否输入有误。` }, { status: 400 });
    }

    step = 'FETCH_HTML';
    console.log(`[WeChat] Fetching: ${url.substring(0, 50)}...`);
    
    let response;
    try {
        response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 15000
        });
    } catch (axiosError: any) {
        return NextResponse.json({ error: `网络错误（${axiosError.code}）：无法访问微信文章。${axiosError.message}` }, { status: 502 });
    }

    step = 'LOAD_HTML';
    const html = response.data;
    const $ = cheerio.load(html);

    const $content = $('#js_content');
    if ($content.length === 0) {
        return NextResponse.json({ error: '未找到正文内容（缺少 #js_content），文章可能已删除或需要验证码。' }, { status: 403 });
    }

    step = 'CLEAN_DOM';
    $('script').remove();
    $('style').remove();
    $('iframe').remove();
    $('.account_qrcode').remove(); 
    $('*').removeAttr('style');

    step = 'PROCESS_IMAGES';
    $('img').each((i, el) => {
      const dataSrc = $(el).attr('data-src');
      const src = $(el).attr('src');
      
      let targetSrc = dataSrc || src;

      if (targetSrc && typeof targetSrc === 'string') {
        // Clean the source url
        targetSrc = targetSrc.replace(/[\n\r\t\s]/g, '');

        if (!targetSrc || targetSrc.startsWith('data:')) return;

        try {
          // Resolve relative URLs
          const resolvedUrl = new URL(targetSrc, url).href;
          
          // Construct proxy URL
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(resolvedUrl)}`;
          $(el).attr('src', proxyUrl);
          $(el).removeAttr('data-src');
        } catch (e) {
          // Log invalid images but don't crash
          console.warn(`[WeChat] Invalid Image URL at index ${i}: ${targetSrc}`);
        }
      }
    });

    step = 'EXTRACT_META';
    const title = $('meta[property="og:title"]').attr('content') || $('h1').text().trim() || '导入文章';
    const contentHtml = $content.html() || '';

    step = 'CONVERT_MARKDOWN';
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        hr: '---'
    });
    
    turndownService.addRule('ignore-invisible', {
        filter: ['style', 'script', 'noscript', 'video', 'audio', 'source'],
        replacement: () => ''
    });

    const markdown = turndownService.turndown(contentHtml);

    return NextResponse.json({ 
      title, 
      content: markdown 
    });

  } catch (error: any) {
    console.error(`[WeChat] Critical Error at Step [${step}]:`, error);
    const safeErrorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({ 
      error: `服务端在步骤「${step}」发生错误：${safeErrorMessage}。` 
    }, { status: 500 });
  }
}
