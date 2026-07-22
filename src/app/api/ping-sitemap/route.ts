import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sitemapUrl = 'https://eellaawedding.com/sitemap.xml';
    const pingUrls = [
      `http://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      // Google deprecated the ping endpoint in late 2023, but we can still call it.
      // For true instant indexing with Google, the Google Indexing API should be used.
      `http://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    ];

    const results = await Promise.all(
      pingUrls.map(async (url) => {
        try {
          const res = await fetch(url, { method: 'GET' });
          return { url, status: res.status, ok: res.ok };
        } catch (err: any) {
          return { url, status: 500, error: err.message };
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Pinged search engines successfully',
      results
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
