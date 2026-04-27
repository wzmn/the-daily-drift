import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get('url');

  if (!blobUrl) return new NextResponse('Missing URL', { status: 400 });

  try {
    const response = await fetch(blobUrl);
    const inputBuffer = await response.arrayBuffer();

    // 1. Process with sharp
    const jpegBuffer = await sharp(Buffer.from(inputBuffer))
      .jpeg({ quality: 90 })
      .toBuffer();

    // 2. CONVERT TO UINT8ARRAY (This fixes the TS error)
    const uint8Array = new Uint8Array(jpegBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': uint8Array.byteLength.toString(),
        'X-Robots-Tag': 'all',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error("Proxy Conversion Error:", e);
    return new NextResponse('Internal Proxy Error', { status: 500 });
  }
}