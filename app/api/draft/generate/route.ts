import { NextResponse } from "next/server";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { put } from "@vercel/blob";
import { Canvas } from "skia-canvas";
import { eq } from "drizzle-orm";
import formatDriftDate from "@/utils/supabase/formatDate";

export async function GET() {
    try {
        const [task] = await db.select()
            .from(drafts)
            .where(eq(drafts.status, "draft"))
            .limit(1);

        if (!task) {
            return NextResponse.json({ message: "No pending tasks." });
        }
        const data = typeof task.newsData === "string" ? JSON.parse(task.newsData) : task.newsData;

        const canvas = new Canvas(1080, 1920);
        const ctx = canvas.getContext("2d");

        // A. Background Gradient
        const grad = ctx.createRadialGradient(540, 960, 100, 540, 960, 1200);
        grad.addColorStop(0, "#18181b");
        grad.addColorStop(1, "#000000");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // B. Decorative Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 1080; i += 100) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke();
        }

        // --- DYNAMIC FONT SCALING & CENTERING ---
        const maxWidth = 900;
        const maxHeight = 1100;
        const boxStartY = 350; 
        let fontSize = 120;
        let lines: string[] = [];
        let finalLineHeight = 0;
        let totalHeight = 0;
        
        const cleanTitle = (task.title || "UNTITLED SIGNAL").toUpperCase();

        while (fontSize > 30) {
            ctx.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`;
            const lineHeight = fontSize * 1.05; 
            lines = [];

            const words = cleanTitle.split(/\s+/);
            let currentLine = '';

            for (let n = 0; n < words.length; n++) {
                let metrics = ctx.measureText(currentLine + words[n] + ' ');
                if (metrics.width > maxWidth && n > 0) {
                    lines.push(currentLine.trim());
                    currentLine = words[n] + ' ';
                } else {
                    currentLine = currentLine + words[n] + ' ';
                }
            }
            lines.push(currentLine.trim());

            totalHeight = lines.length * lineHeight;

            if (totalHeight <= maxHeight && lines.length <= 12) {
                finalLineHeight = lineHeight;
                break;
            }
            fontSize -= 2; 
        }

        // --- CENTERING CALCULATION ---
        const verticalOffset = (maxHeight - totalHeight) / 2;
        const drawStartY = boxStartY + verticalOffset;

        // D. THE RENDERING (White Text)
        ctx.save();
        ctx.textBaseline = "top";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`;

        lines.forEach((line, i) => {
            ctx.fillText(line, 100, drawStartY + (i * finalLineHeight));
        });
        ctx.restore();

        // E. Header & Date
        ctx.fillStyle = "#f97316"; // Orange-500
        ctx.font = "bold 24px Helvetica, Arial, sans-serif";
        ctx.fillText("• SYSTEM SIGNAL LIVE", 100, 150);

        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "bold 30px Helvetica, Arial, sans-serif";
        const today = formatDriftDate(data.publishedAt); // DD/MM/YYYY
        ctx.fillText(`PUBLISHED ON: ${today}`, 100, 200);

        // F. Source & Metadata (Bottom)
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "bold 30px Helvetica, Arial, sans-serif";
        ctx.fillText("SOURCE /", 100, 1650);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 45px Helvetica, Arial, sans-serif";
        ctx.fillText(task.source?.toUpperCase() || "INTEL", 100, 1720);

        // G. Watermark (Moved to End)
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.font = "bold 100px Helvetica, Arial, sans-serif";
        ctx.save();
        ctx.translate(1075, 1850);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("THE DAILY DRIFT", 0, 0);
        ctx.restore();

        const buffer = await canvas.toBuffer("png");
        const blob = await put(`drifts/${task.id}.png`, buffer, { access: "public", allowOverwrite: true });

        await db.update(drafts)
            .set({ imageUrl: blob.url, status: "ready" })
            .where(eq(drafts.id, task.id));

        return NextResponse.json({ success: true, generated: task.title, url: blob.url });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}