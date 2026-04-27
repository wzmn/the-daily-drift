'use client'

import {toast} from "sonner";


export default function PublishButton({ draftId }: { draftId: string }) {
    
    const handlePublish = async () => {
        const response = await fetch("/api/draft/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draftId),
        });

        const result = await response.json();

        if (result.success) {
            toast.success("Successfully published to Instagram!");
            // Refresh your data to show the 'published' status
        } else {
            toast.error(`Error: ${result.error}`);
        }
    };
    return (
        <button
        onClick={handlePublish}

            className="text-xs font-bold text-zinc-400 hover:text-white transition"
        >
            Publish →
        </button>
    )
}