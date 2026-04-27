import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get('url');

  if (!blobUrl) return new NextResponse('Missing URL', { status: 400 });

  try {
    const response = await fetch(blobUrl);
    
    // We get the body as a readable stream
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.byteLength.toString(), // CRITICAL FOR META
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Robots-Tag': 'all',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new NextResponse('Failed to stream image', { status: 500 });
  }
}