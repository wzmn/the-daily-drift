"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Import toast

export default function DashboardActions() {
  const [loading, setLoading] = useState<"fetch" | "generate" | null>(null);
  const router = useRouter();

  const handleAction = async (action: "fetch" | "generate") => {
    setLoading(action);

    // Create a promise for the fetch call
    const actionPromise = fetch(`/api/draft/${action}`).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      return data;
    });

    // Use sonner's toast.promise for the aesthetic loading state
    toast.promise(actionPromise, {
      loading: action === "fetch" ? "Scanning for news signals..." : "Rendering social graphic...",
      success: (data) => {
        router.refresh();
        return action === "fetch" 
          ? "News Synced Successfully" 
          : `Generated: ${data.generated.substring(0, 30)}...`;
      },
      error: (err) => err.message,
    });

    try {
      await actionPromise;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => handleAction("fetch")}
        disabled={!!loading}
        className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all border border-zinc-700"
      >
        {loading === "fetch" ? "SYNCING..." : "1. SYNC NEWS"}
      </button>

      <button
        onClick={() => handleAction("generate")}
        disabled={!!loading}
        className="bg-orange-500 hover:bg-orange-400 text-black px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
      >
        {loading === "generate" ? "GENERATING..." : "2. PROCESS NEXT IMAGE"}
      </button>
    </div>
  );
}