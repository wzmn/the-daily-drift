import { NextResponse } from "next/server";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { eq } from "drizzle-orm";

const IG_USER_ID = process.env.INSTAGRAM_BUSINESS_ID;
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export async function POST(req: Request) {
  try {
    const { draftId } = await req.json();

    // 1. Fetch the draft
    const [draft] = await db.select().from(drafts).where(eq(drafts.id, draftId)).limit(1);

    if (!draft || !draft.imageUrl) {
      return NextResponse.json({ error: "No image found for this draft." }, { status: 404 });
    }

    // Dynamic Base URL: Ensures proxy works on local, preview, and production
    // If you have a fixed custom domain, you can keep "https://www.thedailydraft.xyz"
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || "www.thedailydraft.xyz";
    const baseUrl = `${protocol}://${host}`;

    // STAGE 1: Create the Media Container
    const proxyUrl = `${baseUrl}/api/proxy-image?url=${encodeURIComponent(draft.imageUrl)}`;
    
    const params = new URLSearchParams({
      image_url: proxyUrl,
      caption: draft.title || "",
      media_type: 'STORIES',
      access_token: IG_ACCESS_TOKEN!,
    });

    console.log("Publishing Proxy URL:", proxyUrl);

    const containerResponse = await fetch(
      `https://graph.facebook.com/v20.0/${IG_USER_ID}/media?${params.toString()}`,
      { method: 'POST' }
    );
    
    const containerData = await containerResponse.json();

    if (containerData.error) {
      // Log the full error to help debug Meta's confusing messages
      console.error("Meta Container Error:", containerData.error);
      throw new Error(`Container Creation Failed: ${containerData.error.message}`);
    }

    // STAGE 2: Publish the Container
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