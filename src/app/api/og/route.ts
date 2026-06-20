import { NextResponse } from 'next/server';

// Best-effort OpenGraph fetch. Always returns 200 with whatever it could find;
// a failure yields nulls so the caller falls back gracefully. Never throws.
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url) return NextResponse.json({ image: null, description: null, title: null });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; CodeSphereBot/1.0)' },
    });
    clearTimeout(timeout);
    const html = await res.text();

    return NextResponse.json({
      image: meta(html, 'og:image') ?? meta(html, 'twitter:image'),
      description: meta(html, 'og:description') ?? meta(html, 'description'),
      title: meta(html, 'og:title'),
    });
  } catch {
    return NextResponse.json({ image: null, description: null, title: null });
  }
}

function meta(html: string, prop: string): string | null {
  // Match <meta property="og:image" content="..."> in either attribute order.
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}
