'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default function PublishButton({ draftId }: { draftId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const handlePublish = async () => {
        setLoading(true);

        const actionPromise = fetch("/api/draft/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ draftId }),
        }).then(async (res) => {
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || "Action failed");
            return result;
        });

        toast.promise(actionPromise, {
            loading: "Publishing to Instagram...",
            success: () => {
                router.refresh();
                return "Successfully published to Instagram!";
            },
            error: (err) => `Error: ${err.message}`,
        });

        try {
            await actionPromise;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <button
            onClick={handlePublish}
            disabled={loading}
            className="text-xs font-bold text-zinc-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? "Publishing..." : "Publish →"}
        </button>
    )
}