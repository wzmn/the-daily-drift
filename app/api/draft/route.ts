import { NextResponse } from "next/server";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { getTrendingNews } from "@/lib/engine/news";
import { put } from "@vercel/blob";
import { Canvas } from "skia-canvas";

export async function GET(req: Request) {
  // 1. Security Check for Cron Jobs
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Only check secret if in production
  if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch the News
    const allNews = await getTrendingNews();
    if (!allNews) return NextResponse.json({ error: "No news found" }, { status: 404 });

    const insertedDrafts: { status: string | null; title: string; id: string; source: string | null; newsData: unknown; imageUrl: string | null; igPostId: string | null; createdAt: Date; }[] = [];

    const results = await Promise.all(allNews.map(async (news: any) => {
      // 3. Generate Image (Skia-Canvas)
      const canvas = new Canvas(1080, 1920);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1080, 1920);

      // Headline logic
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 60pt Helvetica";
      // (Add your wrapText logic here to handle long headlines like Ray Dalio's)
      ctx.fillText(news.title.substring(0, 50) + "...", 100, 500);

      const buffer = await canvas.toBuffer("png");

      // 4. Upload to Vercel Blob
      const blob = await put(`drafts/${Date.now()}.png`, buffer, {
        access: "public",
      });

      // 5. Push to Database
      const [newRecord] = await db.insert(drafts).values({
        title: news.title,
        source: news.source,
        newsData: news,
        imageUrl: blob.url,
        status: "draft",
      }).returning();

      insertedDrafts.push(newRecord);

    }));
    return NextResponse.json({
      success: true,
      data: insertedDrafts
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}