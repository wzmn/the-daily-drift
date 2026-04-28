/** @jsxImportSource react */
import React from "react";
import { NextResponse } from "next/server";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import formatDriftDate from "@/utils/supabase/formatDate";
import { ImageResponse } from '@vercel/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs'; // Required to use 'fs' and standard DB drivers

export async function GET() {
    try {
        const [task] = await db.select()
            .from(drafts)
            .where(eq(drafts.status, "draft"))
            .limit(1);

        if (!task) return NextResponse.json({ message: "No pending tasks." });

        const data = typeof task.newsData === "string" ? JSON.parse(task.newsData) : (task.newsData || {});

        // 1. Create a safe date fallback
        // If publishedAt is missing, use task.createdAt or the current time
        const rawDate = data.publishedAt || task.createdAt || new Date().toISOString();
        const today = formatDriftDate(rawDate);

        // --- LOCAL FONT LOADING ---
        // This is much faster and more reliable than fetch()
        const fontPath = join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf');
        const fontData = readFileSync(fontPath);

        const imageResponse = new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#000',
                    backgroundImage: 'radial-gradient(circle at 540px 960px, #18181b 0%, #000 100%)',
                    padding: '140px',
                    color: '#fff',
                }}>
                    <div style={{ display: 'flex', color: '#f97316', fontSize: 24, fontWeight: 700 }}>• SYSTEM SIGNAL LIVE</div>
                    <div style={{ display: 'flex', color: 'rgba(255, 255, 255, 0.4)', fontSize: 30, fontWeight: 700, marginBottom: 100 }}>
                        PUBLISHED: {today}
                    </div>
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        alignItems: 'center',
                        fontSize: 85,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        lineHeight: 1.1
                    }}>
                        {task.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', color: 'rgba(255, 255, 255, 0.4)', fontSize: 30, fontWeight: 700 }}>SOURCE /</div>
                        <div style={{ display: 'flex', fontSize: 45, fontWeight: 700 }}>{task.source?.toUpperCase() || "INTEL"}</div>
                    </div>
                </div>
            ),
            {
                width: 1080,
                height: 1920,
                fonts: [{ name: 'Inter', data: fontData, weight: 700 }]
            }
        );

        const imageBuffer = await imageResponse.arrayBuffer();

        const blob = await put(`drifts/${task.id}.png`, imageBuffer, {
            access: "public",
            contentType: "image/png",
        });

        await db.update(drafts)
            .set({ imageUrl: blob.url, status: "ready" })
            .where(eq(drafts.id, task.id));

        return NextResponse.json({ success: true, url: blob.url });

    } catch (error: any) {
        console.error("GENERATE_ERROR:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}