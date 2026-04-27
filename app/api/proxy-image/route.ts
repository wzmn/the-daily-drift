import { NextResponse } from 'next/server';
const BYPASS_TOKEN = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get('url');
  
  if (!blobUrl) return new NextResponse('Missing URL', { status: 400 });

  // Use the bypass token for the INTERNAL fetch so Vercel lets the server through
  const protectedUrl = `${blobUrl}?x-vercel-protection-bypass=${BYPASS_TOKEN}`;

  const response = await fetch(protectedUrl);
  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'X-Robots-Tag': 'all', 
      'Cache-Control': 'no-store', // Don't cache the protection-bypassed image
    },
  });
}