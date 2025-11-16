"use client"

import { useEffect, useMemo, useState, type MouseEvent } from "react"

export type PipelineResult = {
    summary: string
    overlaps: any[]
    contradictions: any[]
}

export type Difference = {
    id1: string
    id2: string
    excerpt1: string
    excerpt2: string
    pageNumber1: number
    pageNumber2: number
    filename1: string
    filename2: string
    explanation: string
    type: "CONTRADICTION" | "OVERLAP"
}

type Document = {
    id: string
    differences: Difference[]
}

async function loadDocDifferences(docId: string): Promise<PipelineResult[]> {
    return fetch(`/api/differences?docStartName=${docId}`).then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }
        return res.json()
    })
}

async function loadDocumentContent(
    docId: string,
    page: number
): Promise<string> {
    return fetch(
        `/api/documents?docId=${encodeURIComponent(`%${docId}`)}&page=${encodeURIComponent(
            page
        )}`
    ).then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }
        return res.text()
    })
}

async function createDocumentList(): Promise<Document[]> {
    const list = [
        "EBA GL 2020 06 Final Report on GL on loan origination and monitoring.di",
        "Final Guidelines on Accounting for Expected Credit Losses (EBA-GL-2017-06).di",
    ]

    const documents = await Promise.all(
        list.map(async (id): Promise<Document> => {
            const results = await loadDocDifferences(id)
            const diffs: Difference[] = []

            for (const res of results) {
                for (const ov of res.overlaps) {
                    diffs.push(ov)
                }
                for (const ct of res.contradictions) {
                    diffs.push(ct)
                }
            }

            return {
                id,
                differences: diffs,
            }
        })
    )

    return documents
}

// HTML escaper for safe innerHTML
function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

// Escape text for use inside a regex
function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Stable diff key shared between highlight and issue card
function getDiffKey(diff: Difference, index: number): string {
    return `${diff.id1}-${diff.id2}-${index}`
}

// Build highlighted HTML for this page based on excerpt1 of differences where this doc is side 1
// This version is whitespace tolerant so newlines or multiple spaces do not break matching.
function buildHighlightedHtml(
    content: string,
    diffsForThisDocAndPage: Difference[]
): string {
    if (!content) return ""

    // Work on plain text first, then escape at the end
    let textWithMarkers = content

    type MarkerInfo = { markerId: string; diff: Difference; index: number }
    const markers: MarkerInfo[] = []

    diffsForThisDocAndPage.forEach((diff, index) => {
        const rawExcerpt = diff.excerpt1?.trim()
        if (!rawExcerpt) return

        // Escape for regex, then make all whitespace sequences flexible
        const escapedForRegex = escapeRegex(rawExcerpt)
        const pattern = escapedForRegex.replace(/\s+/g, "\\s+")
        const re = new RegExp(pattern)

        const markerId = `__DIFF_${index}_${diff.id1}_${diff.id2}__`

        if (!re.test(textWithMarkers)) {
            return
        }

        // Replace only the first occurrence for this diff
        textWithMarkers = textWithMarkers.replace(re, markerId)
        markers.push({ markerId, diff, index })
    })

    // Now escape the entire text for HTML
    let html = escapeHtml(textWithMarkers)

    // Replace markers with highlighted spans
    markers.forEach(({ markerId, diff, index }) => {
        const isContradiction = diff.type === "CONTRADICTION"

        const badgeClasses = isContradiction
            ? "bg-red-500/30 text-red-100 border border-red-400/70"
            : "bg-emerald-500/30 text-emerald-100 border border-emerald-400/70"

        const escapedExcerpt = escapeHtml(diff.excerpt1.trim())
        const diffKey = getDiffKey(diff, index)

        const spanHtml =
            `<span class="${badgeClasses} rounded px-0.5 py-0.5 inline-block cursor-pointer" ` +
            `data-diff-key="${diffKey}">` +
            `<span class="align-middle">${escapedExcerpt}</span>` +
            `</span>`

        html = html.replace(markerId, spanHtml)
    })

    return html
}

export default function LegalReaderPage() {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [docList, setDocList] = useState<Document[]>([])
    const [selectedDoc, setSelectedDoc] = useState<number | null>(null)
    const [page, setPage] = useState<number>(1)
    const [content, setContent] = useState<string>("")

    // Currently selected highlight key in the document
    const [activeDiffKey, setActiveDiffKey] = useState<string | null>(null)

    useEffect(() => {
        createDocumentList()
            .then((docs) => {
                setDocList(docs)
                setLoaded(true)
            })
            .catch((err) => {
                console.error("Error loading document list:", err)
                setError(err.message)
                setLoaded(true)
            })
    }, [])

    useEffect(() => {
        if (selectedDoc !== null && docList[selectedDoc]) {
            const docId = docList[selectedDoc].id
            loadDocumentContent(docId, page)
                .then((text) => {
                    try {
                        const parsed = JSON.parse(text)
                        setContent(parsed.content ?? "")
                    } catch (e) {
                        console.error(
                            "Failed to parse document content response:",
                            e
                        )
                        setContent("Invalid document content format.")
                    }
                })
                .catch((err) => {
                    console.error("Error loading document content:", err)
                    setContent("Error loading content.")
                })
        } else {
            setContent("")
        }

        // Reset active highlight when changing page or document
        setActiveDiffKey(null)
    }, [selectedDoc, page, docList])

    const currentDoc = useMemo(
        () => (selectedDoc !== null ? (docList[selectedDoc] ?? null) : null),
        [selectedDoc, docList]
    )

    // Differences relevant to the current page (side 1) for the right panel and highlighting
    const currentPageDifferences = useMemo(() => {
        if (!currentDoc) return []
        return currentDoc.differences.filter((d) => d.pageNumber1 === page)
    }, [currentDoc, page])

    const highlightedHtml = useMemo(
        () => buildHighlightedHtml(content, currentPageDifferences),
        [content, currentPageDifferences]
    )

    const goToPrevPage = () => {
        setPage((p) => Math.max(1, p - 1))
    }

    const goToNextPage = () => {
        setPage((p) => p + 1)
    }

    // Handle clicks inside the document viewer and capture clicks on highlighted spans
    const handleHighlightClick = (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement | null
        if (!target) return

        const span = target.closest("[data-diff-key]") as HTMLElement | null
        if (!span) return

        const diffKey = span.getAttribute("data-diff-key")
        if (!diffKey) return

        setActiveDiffKey(diffKey)
    }

    // When a highlight is clicked and activeDiffKey is set, scroll the matching issue card into view
    useEffect(() => {
        if (!activeDiffKey) return

        const selector = `[data-role="issue"][data-diff-key="${activeDiffKey}"]`
        const issueEl = document.querySelector<HTMLElement>(selector)
        if (!issueEl) return

        issueEl.scrollIntoView({ behavior: "smooth", block: "nearest" })

        // Temporary visual emphasis on the issue card
        issueEl.classList.add(
            "ring-2",
            "ring-amber-400",
            "ring-offset-2",
            "ring-offset-slate-900"
        )

        const timeoutId = window.setTimeout(() => {
            issueEl.classList.remove(
                "ring-2",
                "ring-amber-400",
                "ring-offset-2",
                "ring-offset-slate-900"
            )
        }, 1500)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [activeDiffKey])

    return (
        <div className="flex flex-col h-screen bg-slate-800 text-slate-50">
            {/* Top bar */}
            <header className="w-full bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold">
                        Legal Reader with References
                    </h1>
                </div>
                <div className="flex items-center gap-3"></div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar */}
                <aside className="w-72 bg-slate-900/80 border-r border-slate-700 p-3 overflow-y-auto">
                    <h2 className="text-sm font-semibold text-slate-200 mb-2">
                        Documents
                    </h2>

                    {!loaded && (
                        <p className="text-xs text-slate-400">
                            Loading pipeline result ...
                        </p>
                    )}

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    {loaded && !error && docList.length === 0 && (
                        <p className="text-xs text-slate-400">
                            No documents with overlaps or contradictions.
                        </p>
                    )}

                    <div className="space-y-2 mt-2">
                        {docList.map((doc, index) => (
                            <div
                                key={doc.id}
                                className={`p-2 rounded-lg cursor-pointer hover:bg-slate-700/50 ${
                                    selectedDoc === index
                                        ? "bg-slate-700/60"
                                        : ""
                                }`}
                                onClick={() => {
                                    setSelectedDoc(index)
                                    setPage(1)
                                }}
                            >
                                <p className="text-sm font-medium">{doc.id}</p>
                                <p className="text-xs text-slate-400">
                                    {doc.differences.length} references
                                </p>
                                <p className="text-xs text-slate-400">
                                    {
                                        doc.differences.filter(
                                            (d) => d.type === "OVERLAP"
                                        ).length
                                    }{" "}
                                    overlaps,{" "}
                                    {
                                        doc.differences.filter(
                                            (d) => d.type === "CONTRADICTION"
                                        ).length
                                    }{" "}
                                    contradictions
                                </p>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main viewer and issue details */}
                <main className="flex-1 flex flex-col bg-slate-800/60">
                    {/* Page controls */}
                    <div className="border-b border-slate-700 px-4 py-2 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium">
                                {currentDoc ? currentDoc.id : ""}
                            </div>
                        </div>
                        {selectedDoc !== null && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={page <= 1}
                                    className="px-2 py-1 text-xs rounded-lg bg-slate-900 border border-slate-600 disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-mono text-slate-200">
                                    Page {page}
                                </span>
                                <button
                                    onClick={goToNextPage}
                                    className="px-2 py-1 text-xs rounded-lg bg-slate-900 border border-slate-600"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Document viewer */}
                        <section className="flex-1 overflow-hidden bg-slate-900/70">
                            {selectedDoc !== null ? (
                                <div className="w-full h-full">
                                    {content && (
                                        <div
                                            className="
                                                rounded-b-2xl
                                                bg-slate-950/70 border border-slate-800
                                                p-6 shadow-xl min-h-[500px] max-h-full overflow-y-auto
                                                whitespace-pre-wrap font-mono leading-relaxed text-[14px]
                                                text-slate-200 cursor-text
                                            "
                                            onClick={handleHighlightClick}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightedHtml,
                                                }}
                                            />
                                        </div>
                                    )}

                                    {!content && (
                                        <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                                            No content for this page.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                                    Select a document from the left to start
                                    reading.
                                </div>
                            )}
                        </section>

                        {/* Right panel issues */}
                        <aside className="w-96 border-l border-slate-700 bg-slate-900/90 p-3 overflow-y-auto">
                            <h2 className="text-sm font-semibold text-slate-100 mb-2">
                                Issues on page {page}
                            </h2>

                            {selectedDoc !== null &&
                                currentPageDifferences.length === 0 && (
                                    <p className="text-xs text-slate-400">
                                        No overlaps or contradictions on this
                                        page.
                                    </p>
                                )}

                            <div className="space-y-3">
                                {currentPageDifferences.map((diff, idx) => {
                                    const diffKey = getDiffKey(diff, idx)
                                    return (
                                        <div
                                            key={`${diff.id1}-${diff.id2}-${idx}`}
                                            className={`p-3 rounded-lg border text-xs shadow-sm transition-shadow ${
                                                diff.type === "CONTRADICTION"
                                                    ? "bg-red-50/5 border-red-500/40"
                                                    : "bg-emerald-50/5 border-emerald-500/40"
                                            }`}
                                            data-role="issue"
                                            data-diff-key={diffKey}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={`px-2 m-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        diff.type ===
                                                        "CONTRADICTION"
                                                            ? "bg-red-500/20 text-red-300 border border-red-500/60"
                                                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60"
                                                    }`}
                                                >
                                                    {diff.type}
                                                </span>
                                                <span className="text-[10px] text-slate-300">
                                                    Compared with{" "}
                                                    {decodeURIComponent(
                                                        diff.filename2
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-1">
                                                <p className="font-medium text-slate-100 mb-1">
                                                    Excerpt in this document
                                                </p>
                                                <p className="text-slate-100 whitespace-pre-line">
                                                    {diff.excerpt1}
                                                </p>
                                                <p className="mt-2 text-[11px] text-slate-300">
                                                    Other document excerpt:
                                                </p>
                                                <p className="text-slate-200 whitespace-pre-line">
                                                    {diff.excerpt2}
                                                </p>
                                            </div>

                                            {diff.explanation && (
                                                <div className="mt-2 border-t border-slate-700 pt-2">
                                                    <p className="font-medium text-slate-100 mb-1">
                                                        Explanation
                                                    </p>
                                                    <p className="text-slate-200 whitespace-pre-line">
                                                        {diff.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    )
}
