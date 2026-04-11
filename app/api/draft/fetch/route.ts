import { NextResponse } from "next/server";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { getTrendingNews } from "@/lib/engine/news";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  // 1. Cron Secret Security (Optional but recommended)
  const { searchParams } = new URL(req.url);
  if (process.env.NODE_ENV === "production" && searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allNews = await getTrendingNews();
    if (!allNews || allNews.length === 0) return NextResponse.json({ error: "No news found" }, { status: 404 });

    let newStoriesCount = 0;

    for (const news of allNews) {
      // 2. Efficient Duplicate Check
      const existing = await db.select()
        .from(drafts)
        .where(eq(drafts.url, news.url))
        .limit(1);

      if (existing.length === 0) {
        // 3. Store raw news data only (No image yet!)
        await db.insert(drafts).values({
          title: news.title,
          source: news.source,
          url: news.url,
          newsData: news,
          status: "draft", // New status for unprocessed news
        });
        newStoriesCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ingested ${newStoriesCount} new stories.`,
      found: allNews.length
    });

  } catch (error: any) {
    console.error("Ingestor Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}