import { NextResponse } from "next/server";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { eq } from "drizzle-orm";

const IG_USER_ID = process.env.INSTAGRAM_BUSINESS_ID;
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export async function POST(req: Request) {
  try {
    const { draftId } = await req.json();

    // 1. Fetch the draft (ensure it has a Vercel Blob URL)
    const [draft] = await db.select().from(drafts).where(eq(drafts.id, draftId)).limit(1);

    if (!draft || !draft.imageUrl) {
      return NextResponse.json({ error: "No image found for this draft." }, { status: 404 });
    }

    // STAGE 1: Create the Media Container
    // Meta will grab the image from your public Vercel Blob URL
    const containerUrl = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`;
    const paramsDebug = {
      image_url: `https://thedailydraft.xyz/api/proxy-image?url=${encodeURIComponent(draft.imageUrl)}`,
      caption: draft.title || "",
      media_type: 'STORIES',
      access_token: IG_ACCESS_TOKEN!,
    }
    console.log(paramsDebug);
    const containerParams = new URLSearchParams(paramsDebug);

    const containerResponse = await fetch(
      `https://graph.facebook.com/v20.0/${IG_USER_ID}/media?${containerParams.toString()}`,
      { method: 'POST' }
    );
    const containerData = await containerResponse.json();


    if (containerData.error) {
      throw new Error(`Container Creation Failed: ${containerData.error.message}`);
    }

    const publishResponse = await fetch(
      `https://graph.facebook.com/v20.0/${IG_USER_ID}/media_publish?creation_id=${containerData.id}&access_token=${IG_ACCESS_TOKEN}`,
      { method: 'POST' }
    );
    const publishData = await publishResponse.json();

    if (publishData.error) {
      throw new Error(`Publishing Failed: ${publishData.error.message}`);
    }

    // 3. Update Database Status
    await db.update(drafts)
      .set({
        status: "published",
        publishedAt: new Date(),
        igMediaId: publishData.id
      })
      .where(eq(drafts.id, draft.id));

    return NextResponse.json({ success: true, ig_id: publishData.id });

  } catch (error: any) {
    console.error("IG_PUBLISH_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}