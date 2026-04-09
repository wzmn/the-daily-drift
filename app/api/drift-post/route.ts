import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Canvas, loadImage } from 'skia-canvas';
import { getTrendingNews } from '@/lib/engine/news';
import axios from 'axios';

export const maxDuration = 60; // Extend timeout for image processing

export async function POST(request: Request) {
    try {
        // 1. Fetch the latest news from your NewsData engine
        const news = await getTrendingNews();
        if (!news) return NextResponse.json({ error: "No news found" }, { status: 404 });

        // 2. Generate the "Daily Drift" Image
        const canvas = new Canvas(1080, 1920);
        const ctx = canvas.getContext('2d');

        // --- DRAWING LOGIC ---
        ctx.fillStyle = '#0F0F0F'; // Dark background
        ctx.fillRect(0, 0, 1080, 1920);

        // If NewsData provided an image, draw it blurred in the background
        if (news.imageUrl) {
            try {
                const bgImg = await loadImage(news.imageUrl);
                ctx.globalAlpha = 0.3;
                ctx.drawImage(bgImg, -200, 0, 1480, 1920); // Slight zoom/offset
                ctx.globalAlpha = 1.0;
            } catch (e) { console.log("BG Image failed to load, skipping..."); }
        }

        // Title & Headline
        ctx.fillStyle = 'white';
        ctx.font = 'bold 50pt Helvetica';
        ctx.fillText('THE DAILY DRIFT', 80, 150);

        ctx.font = 'bold 80pt Helvetica';
        // Simple text wrapping for long headlines
        const words = news.title.split(' ');
        let line = '';
        let y = 800;
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (testLine.length > 20) {
                ctx.fillText(line, 80, y);
                line = words[n] + ' ';
                y += 100;
            } else { line = testLine; }
        }
        ctx.fillText(line, 80, y);

        // 3. Convert Canvas to Buffer
        const buffer = await canvas.toBuffer('image/png');

        // 4. Upload to Vercel Blob (This gives us the public URL IG needs)
        const blob = await put(`drifts/${Date.now()}.png`, buffer, {
            access: 'public',
            addRandomSuffix: true,
        });

        // 5. Tell Instagram to fetch and post the image
        // Note: You need your IG_USER_ID and ACCESS_TOKEN in .env
        const igContainer = await axios.post(
            `https://graph.facebook.com/v24.0/${process.env.INSTAGRAM_USER_ID}/media`,
            {
                image_url: blob.url,
                caption: `${news.title}\n\nVia ${news.source} #TheDailyDrift #News`,
                access_token: process.env.INSTAGRAM_ACCESS_TOKEN
            }
        );

        const publish = await axios.post(
            `https://graph.facebook.com/v24.0/${process.env.INSTAGRAM_USER_ID}/media_publish`,
            {
                creation_id: igContainer.data.id,
                access_token: process.env.INSTAGRAM_ACCESS_TOKEN
            }
        );

        return NextResponse.json({
            success: true,
            ig_post_id: publish.data.id,
            image_url: blob.url
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}