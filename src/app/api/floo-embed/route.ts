import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const upstreamUrl = 'https://www.hpvn-archive.net/floo?hpvn_update=ea7cfe4';
    const res = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return new NextResponse(`Lỗi tải Mạng Floo từ máy chủ gốc: ${res.status}`, { status: res.status });
    }

    let html = await res.text();

    // 1. Inject <base href="https://www.hpvn-archive.net/"> right after <head>
    // so all relative chunks, CSS, images, and fonts resolve cleanly to upstream
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head><base href="https://www.hpvn-archive.net/">');
    } else {
      html = html.replace('<html>', '<html><head><base href="https://www.hpvn-archive.net/"></head>');
    }

    // 2. Inject subtle styling to harmonize with 7 Potters and enforce zero-shadow
    const customStyle = `
      <style>
        /* Zero shadow override to match 7 Potters requirement */
        *, *::before, *::after {
          box-shadow: none !important;
          text-shadow: none !important;
          --tw-shadow: 0 0 #0000 !important;
        }
        /* Custom scrollbar matching dark parchment */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #140b05;
        }
        ::-webkit-scrollbar-thumb {
          background: #7a5229;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #bd8436;
        }
      </style>
    `;
    html = html.replace('</head>', `${customStyle}</head>`);

    // 3. Set headers allowing framing inside 7 Potters
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    headers.set('Content-Security-Policy', "frame-ancestors 'self' https://seven-potters.vercel.app http://localhost:3000 *;");

    return new NextResponse(html, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Error proxying Floo shoutbox:', err);
    return new NextResponse(`Không thể kết nối Mạng Floo: ${err?.message || err}`, { status: 500 });
  }
}
