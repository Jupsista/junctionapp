"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AiOutputProps = {
  latestUserMessage: string | null;
};

export const AiOutput: React.FC<AiOutputProps> = ({ latestUserMessage }) => {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!latestUserMessage) return;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: latestUserMessage }),
        });

        const json = await res.json();

        if (json.error) throw new Error(json.error);

        setMarkdown(json.content);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [latestUserMessage]);

  return (
    <div className="w-full p-4 bg-zinc-900 text-white rounded-lg min-h-[200px]">
      {loading && <div className="text-blue-400">AI is analyzing...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {!loading && !error && markdown && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
        >
          {markdown}
        </ReactMarkdown>
      )}
    </div>
  );
};
