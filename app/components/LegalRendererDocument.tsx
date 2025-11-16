"use client"

import { useEffect, useState, useRef } from "react"

type LegalPage = {
    page: number
    content: string
    filePath: string
}

interface Props {
    docName: string
    page: number
    excerpt: string
    fileName: string
}

// Highlights the excerpt inside the content
function highlightExcerpt(content: string, excerpt: string) {
    if (!excerpt || !content) return content

    // Escape regex characters in excerpt
    const escaped = excerpt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    // Convert ALL whitespace in excerpt into a wildcard that matches any whitespace,
    // including newlines, spaces, tabs, multiple spaces, etc.
    const whitespaceInsensitive = escaped.replace(/\s+/g, "\\s+")

    // Create the final regex
    const regex = new RegExp(whitespaceInsensitive, "gi")

    return content.replace(
        regex,
        (match) =>
            `<mark style="background:#facc15; color:black; padding:2px; border-radius:4px;">${match}</mark>`
    )
}

export default function LegalRendererDocument({
    docName: docName,
    page,
    excerpt,
    fileName,
}: Props) {
    const [data, setData] = useState<LegalPage | null>(null)
    const [loading, setLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        console.log("DOCID: ", docName, "FILENAME: ", fileName, "PAGE: ", page)
    }, [docName])

    /** Fetch page */
    const loadPage = async (p: number) => {
        setLoading(true)
        try {
            const res = await fetch(
                `/api/documentname?docName=${fileName}&page=${p}`
            )
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
    }, [page, docName])

    // Auto-scroll to first highlight
    useEffect(() => {
        if (!data || !excerpt) return

        const el = containerRef.current
        if (!el) return

        const mark = el.querySelector("mark")
        if (mark) {
            mark.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [data, excerpt, loading])

    // Auto-scroll to first highlight
    useEffect(() => {
        if (!data || !excerpt) return

        const el = containerRef.current
        if (!el) return

        const mark = el.querySelector("mark")
        if (mark) {
            mark.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [data, excerpt])

    return (
        <div className="w-full h-full flex flex-col">
            {/* HEADER (fixed) */}
            <div
                className="flex items-center justify-between rounded-t-2xl
                        bg-slate-900/80 border border-slate-800
                        px-5 py-4 shadow-lg"
            >
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Document
                    </p>
                    <p className="text-lg font-semibold text-slate-100">
                        {fileName}
                    </p>
                </div>
            </div>

            {/* CONTENT — ONLY THIS SCROLLS */}
            <div
                ref={containerRef}
                className="
                flex-1 overflow-auto
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

                {!loading && data && (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: highlightExcerpt(data.content, excerpt),
                        }}
                    />
                )}

                {!loading && !data && (
                    <div className="text-red-400 font-semibold">
                        No data found for this page.
                    </div>
                )}
            </div>
        </div>
    )
}
