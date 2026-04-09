"use server";

import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { getTrendingNews } from "@/lib/engine/news";
import { Canvas, loadImage } from "skia-canvas";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function createDraft() {
  try {
    // 1. Fetch from NewsData.io
    const news = await getTrendingNews();
    if (!news) return { success: false, error: "No news found in the last hour." };

    // 2. Setup Canvas (1080x1920 for IG Stories/Reels)
    const canvas = new Canvas(1080, 1920);
    const ctx = canvas.getContext("2d");

    // Drawing the background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 1080, 1920);

    // Headline Text Styling
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 70pt Helvetica";
    
    // Simple wrapping logic
    const words = news.title.split(" ");
    let line = "";
    let y = 500;
    for (const word of words) {
      if ((line + word).length > 18) {
        ctx.fillText(line.trim(), 80, y);
        line = word + " ";
        y += 110;
      } else {
        line += word + " ";
      }
    }
    ctx.fillText(line.trim(), 80, y);

    // Source Tag
    ctx.fillStyle = "#ff3b30"; // "Drift" Red
    ctx.font = "30pt Helvetica";
    ctx.fillText(news.source.toUpperCase(), 80, 400);

    // 3. Generate Buffer & Upload to Vercel Blob
    const buffer = await canvas.toBuffer("png");
    const blob = await put(`drafts/${Date.now()}.png`, buffer, {
      access: "public",
      addRandomSuffix: true,
    });

    // 4. Record the Drift in Supabase
    const [inserted] = await db.insert(drafts).values({
      title: news.title,
      source: news.source,
      newsData: news,
      imageUrl: blob.url,
      status: "draft", // Stays as draft until you hit 'Post'
    }).returning();

    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      id: inserted.id, 
      url: blob.url 
    };

  } catch (error: any) {
    console.error("Draft Action Error:", error);
    return { success: false, error: error.message };
  }
}