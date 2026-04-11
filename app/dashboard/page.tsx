import { auth } from "@/lib/engine/auth"; // Fixed path to your auth instance
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/engine/db";
import { drafts } from "@/lib/engine/schema";
import { desc, sql } from "drizzle-orm";
import DashboardActions from "@/app/components/DashboardActions";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  // 1. Protect the page
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // 2. Fetch history using Drizzle (Order by newest first)
  const history = await db
    .select()
    .from(drafts)
    .orderBy(
      // Access newsData->>'publishedAt' and cast it for sorting
      desc(sql`${drafts.newsData}->>'pubDate'`)
    )
    .limit(limit)
    .offset(offset);

  // 3. Define currentNews as the latest entry in the history
  const currentNews = history.length > 0 ? history[0] : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter">THE DAILY DRAFT</h1>
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
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Current Hourly Draft
            </h2>
            {currentNews ? (
              <div className="space-y-4">
                <div className="p-4 bg-black rounded-lg border border-zinc-800">
                  <p className="text-xs text-orange-500 mb-1">{currentNews.source}</p>
                  <h3 className="text-xl font-medium">{currentNews.title}</h3>
                </div>
                <div className="flex gap-3">
                  <DashboardActions />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-zinc-500 italic">Scanning the horizon for news...</p>
                <a>button here</a>
              </div>
            )}
          </section>

          {/* History Table */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Historical References
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950 text-zinc-500">
                  <tr>
                    <th className="p-4 font-medium">Headline</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Time</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((drift) => (
                      <tr key={drift.id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-zinc-200 font-medium truncate max-w-xs">{drift.title}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-tight">{drift.source}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${drift.status === 'published' ? 'border-green-500 text-green-500' :
                            drift.status === 'ready' ? 'border-orange-500 text-orange-500' :
                              'border-zinc-700 text-zinc-500'
                            }`}>
                            {drift.status}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 tabular-nums">
                          {new Date(drift.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-right">
                          {drift.imageUrl && (
                            <a
                              href={drift.imageUrl}
                              target="_blank"
                              className="text-xs font-bold text-zinc-400 hover:text-white transition"
                            >
                              VIEW GRAPHIC →
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-zinc-600">
                        No drafts found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-500">
              <span>Page {page}</span>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    href={`/dashboard?page=${page - 1}`}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition text-zinc-300"
                  >
                    Previous
                  </Link>
                ) : (
                  <button disabled className="px-3 py-1 bg-zinc-800/30 text-zinc-700 rounded cursor-not-allowed">
                    Previous
                  </button>
                )}
                {history.length === limit ? (
                  <Link
                    href={`/dashboard?page=${page + 1}`}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition text-zinc-300"
                  >
                    Next
                  </Link>
                ) : (
                  <button disabled className="px-3 py-1 bg-zinc-800/30 text-zinc-700 rounded cursor-not-allowed">
                    Next
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Column 3: Stats & Logs */}
        <div className="space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Post Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-4 rounded-lg border border-zinc-800 text-center">
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase">Drafts Ready</p>
              </div>
              <div className="bg-black p-4 rounded-lg border border-zinc-800 text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-[10px] text-zinc-500 uppercase">Total Reach</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}