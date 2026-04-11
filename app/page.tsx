import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default async function HomePage() {
  // Fetch the latest drift to showcase current engine status
  const latestDrifts = await db.select().from(drafts).orderBy(desc(drafts.createdAt)).limit(1);
  const currentDrift = latestDrifts[0];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-black">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-zinc-800/50">
        <h1 className="text-xl font-black tracking-tighter italic">THE DAILY DRIFT</h1>
        <div className="flex gap-6 items-center">
          <Link href="/login" className="text-sm font-medium hover:text-orange-500 transition">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Engine v1.0 Live
            </div>
            
            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              AUTOMATED <br /> <span className="text-zinc-500">NEWS DRIFT.</span>
            </h2>
            
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
              Transforming global tech trends into high-fidelity social graphics. Built with Next.js 15, Better-Auth, and Drizzle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-orange-500 text-black font-black px-8 py-4 rounded-xl hover:bg-orange-400 transition">
                ENTER DASHBOARD <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Real-time Preview Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-zinc-800 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-zinc-950 border border-zinc-800 p-8 rounded-2xl">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Latest Processed Signal</h3>
              {currentDrift ? (
                <div className="space-y-4">
                  <div className="aspect-[4/5] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 relative">
                    {/* If you have an image, show it, otherwise show headline */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black to-transparent">
                        <p className="text-orange-500 text-xs font-bold mb-1">{currentDrift.source}</p>
                        <p className="text-xl font-bold leading-tight line-clamp-3">{currentDrift.title}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg">
                  <p className="text-zinc-600 italic">Engine waiting for first drift...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 border-t border-zinc-800 pt-16">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-orange-500"><Zap /></div>
            <h4 className="font-bold text-xl">Instant Generation</h4>
            <p className="text-zinc-500 text-sm">Skia-Canvas rendering turns raw JSON into optimized PNGs in under 200ms.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-orange-500"><Shield /></div>
            <h4 className="font-bold text-xl">Better-Auth Secure</h4>
            <p className="text-zinc-500 text-sm">Protected by industrial-grade session management and Supabase storage.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-orange-500"><Globe /></div>
            <h4 className="font-bold text-xl">Global Signals</h4>
            <p className="text-zinc-500 text-sm">Real-time technology news monitoring from high-authority global domains.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-12 text-center border-t border-zinc-800/50 text-zinc-600 text-sm">
        © 2026 THE DAILY DRIFT — Wiseman.dev
      </footer>
    </div>
  );
}