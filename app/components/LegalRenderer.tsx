"use client"

import { useEffect, useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Highlighter } from "lucide-react"

type LegalPage = {
    page: number
    content: string
    filePath: string
}

interface Props {
    docId: string
    initialPage?: number
    onHighlight?: (highlight: { text: string; page: number }) => void
}

export default function LegalRenderer({
    docId,
    initialPage = 1,
    onHighlight,
}: Props) {
    const [page, setPage] = useState(initialPage)
    const [data, setData] = useState<LegalPage | null>(null)
    const [loading, setLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        console.log("DOCID: ", docId)
    }, [docId])

    /** Fetch page */
    const loadPage = async (p: number) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/documents?docId=${docId}&page=${p}`)
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            setData(json)
        } catch (err) {
            console.error(err)
            setData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPage(page)
    }, [page, docId])

    /** Highlight handler */
    const handleMouseUp = () => {
        const selection = window.getSelection()
        if (!selection || !selection.toString().trim()) return

        const selectedText = selection.toString().trim()
        onHighlight?.({ text: selectedText, page })
    }

    return (
        <div className="w-full">
            {/* HEADER */}
            <div className="flex items-center justify-between rounded-t-2xl bg-slate-900/80 border border-slate-800 px-5 py-4 shadow-lg">
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Document
                    </p>
                    <p className="text-lg font-semibold text-slate-100">
                        {docId}
                    </p>
                </div>

                <div className="flex items-center">
                    {/* Prev */}
                    <button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page <= 1}
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 disabled:opacity-30 disabled:hover:border-slate-700"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-200" />
                    </button>

                    <span className="text-sm font-mono px-2 text-slate-300">
                        Page {page}
                    </span>

                    {/* Next */}
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-200" />
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div
                ref={containerRef}
                onMouseUp={handleMouseUp}
                className="
            rounded-b-2xl
          bg-slate-950/70 border border-slate-800
          p-6 shadow-xl min-h-[500px]
          whitespace-pre-wrap font-mono leading-relaxed text-[14px]
          text-slate-200 cursor-text
        "
            >
                {loading && (
                    <div className="text-slate-400 italic animate-pulse">
                        Loading…
                    </div>
                )}

                {!loading && data && <>{data.content}</>}

                {!loading && !data && (
                    <div className="text-red-400 font-semibold">
                        No data found for this page.
                    </div>
                )}
            </div>

            {/* HIGHLIGHT HELP */}
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                <Highlighter className="w-3 h-3" />
                Select text inside the page to save a highlight for later
                comparison.
            </div>
        </div>
    )
}
