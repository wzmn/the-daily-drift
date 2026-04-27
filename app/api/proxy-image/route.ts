import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get('url');

  if (!blobUrl) return new NextResponse('Missing URL', { status: 400 });

  try {
    const response = await fetch(blobUrl);
    
    // We get the body as a readable stream
    const body = response.body;

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'image/png',
        'X-Robots-Tag': 'all',
        'Cache-Control': 'no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new NextResponse('Failed to stream image', { status: 500 });
  }
}