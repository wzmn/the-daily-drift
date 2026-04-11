import { NextResponse } from "next/server";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { getTrendingNews } from "@/lib/engine/news";
import { put } from "@vercel/blob";
import { Canvas } from "skia-canvas";
import { eq } from "drizzle-orm";

// Helper for long headlines
function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allNews = await getTrendingNews();
    if (!allNews || allNews.length === 0) return NextResponse.json({ error: "No news found" }, { status: 404 });

    const insertedDrafts = [];

    // Use a for...of loop to handle async duplicate checks sequentially
    for (const news of allNews) {
      // 1. Duplicate Check
      const existing = await db.select()
        .from(drafts)
        .where(eq(drafts.url, news.url))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏩ Skipping duplicate: ${news.title}`);
        continue; 
      }

      // 2. Generate Image (Only for NEW stories)
      const canvas = new Canvas(1080, 1920);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1080, 1920);

      // Headline Style
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 75pt Helvetica"; // Slightly larger
      
      // Draw the wrapped text
      wrapText(ctx, news.title.toUpperCase(), 100, 400, 880, 95);

      // Draw Source
      ctx.fillStyle = "#f97316"; // Orange-500
      ctx.font = "bold 30pt Helvetica";
      ctx.fillText(news.source?.toUpperCase() || "GLOBAL SIGNAL", 100, 300);

      const buffer = await canvas.toBuffer("png");

      // 3. Upload to Vercel Blob
      const filename = `drift-${Date.now()}.png`;
      const blob = await put(`drafts/${filename}`, buffer, {
        access: "public",
      });

      // 4. Save to DB
      const [newRecord] = await db.insert(drafts).values({
        title: news.title,
        source: news.source,
        url: news.url, // Ensure you are saving the URL for the check!
        newsData: news,
        imageUrl: blob.url,
        status: "draft",
      }).returning();

      insertedDrafts.push(newRecord);
      
      console.log(`✅ Generated: ${news.title}`);
    }

    return NextResponse.json({
      success: true,
      count: insertedDrafts.length,
      data: insertedDrafts
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}