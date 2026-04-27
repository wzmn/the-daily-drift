import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get('url');

  if (!blobUrl) return new NextResponse('Missing URL', { status: 400 });

  // Fetch from Blob internally (Server-to-Server doesn't trigger bot protection)
  const response = await fetch(blobUrl);
  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'X-Robots-Tag': 'all', // The magic permission for Meta
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}