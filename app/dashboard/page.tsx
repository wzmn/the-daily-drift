import { auth } from "@/lib/engine/auth"; // Better-Auth session check
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTrendingNews } from "@/lib/engine/news";
import { desc } from "drizzle-orm";
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  // 1. Protect the page
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }
  const supabase = await createClient();
  const { data: history } = await supabase.from('news').select();
  console.log(history)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter">THE DAILY DRIFT</h1>
          <p className="text-zinc-500 text-sm">Control Center v1.0</p>
        </div>
        <div className="flex gap-4">
            <span className="bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                System Live
            </span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Staging Area */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">Current Hourly Drift</h2>
            {currentNews ? (
              <div className="space-y-4">
                <div className="p-4 bg-black rounded-lg border border-zinc-800">
                    <p className="text-xs text-orange-500 mb-1">{currentNews.source}</p>
                    <h3 className="text-xl font-medium">{currentNews.title}</h3>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 transition">
                        Generate & Preview
                    </button>
                    <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-700 transition">
                        Manual Post to IG
                    </button>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 italic">Scanning the horizon for news...</p>
            )}
          </section>

          {/* History Table */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Historical References</h2>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950 text-zinc-500">
                    <tr>
                        <th className="p-4 font-medium">Headline</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {history && history.map((drift) => (
                        <tr key={drift.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                            <td className="p-4 truncate max-w-xs">{drift.title}</td>
                            <td className="p-4">
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                                    drift.status === 'posted' ? 'border-blue-500 text-blue-500' : 'border-zinc-700 text-zinc-500'
                                }`}>
                                    {drift.status}
                                </span>
                            </td>
                            <td className="p-4 text-zinc-500">{new Date(drift.createdAt!).toLocaleTimeString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </section>
        </div>

        {/* Column 3: Stats & Logs */}
        <div className="space-y-6">
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">Post Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black p-4 rounded-lg border border-zinc-800 text-center">
                        <p className="text-2xl font-bold">24</p>
                        <p className="text-[10px] text-zinc-500 uppercase">24h Posts</p>
                    </div>
                    <div className="bg-black p-4 rounded-lg border border-zinc-800 text-center">
                        <p className="text-2xl font-bold">1.2k</p>
                        <p className="text-[10px] text-zinc-500 uppercase">Total Reach</p>
                    </div>
                </div>
            </section>
        </div>
      </main>
    </div>
  );
}