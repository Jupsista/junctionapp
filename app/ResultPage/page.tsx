"use client"
import React, { useEffect, useState } from "react"
import LegalRendererDocument from "../components/LegalRendererDocument"
import DocumentSelector from "../components/DocumentSelector"

type ViewerData = any

type CompareButtonProps = {
    setViewerData: React.Dispatch<React.SetStateAction<ViewerData | null>>
    c: Overlap | Contradiction
    isRed?: boolean
}
const CompareButton = ({
    setViewerData,
    c,
    isRed = false,
}: CompareButtonProps) => {
    console.log("APUAAAAAAAAAAAAAAAAAAAAAAAAA", c)
    return (
        <button
            onClick={() =>
                setViewerData({
                    leftId: c.id1,
                    leftPage: c.pageNumber1,
                    rightId: c.id2,
                    rightPage: c.pageNumber2,
                    excerpt1: c.excerpt1,
                    excerpt2: c.excerpt2,
                    filename1: c.filename1,
                    filename2: c.filename2,
                    explanation: c.explanation,
                })
            }
            className={
                isRed
                    ? "px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    : "px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            }
        >
            Compare in Legal Viewer
        </button>
    )
}

export default function ResultPage() {
    const [loaded, setLoaded] = useState(false)
    const [data, setData] = useState<PipelineResult[]>([])

    const [viewerData, setViewerData] = useState<{
        leftId: string
        leftPage: number
        rightId: string
        rightPage: number
        excerpt1: string
        excerpt2: string
        filename1: string
        filename2: string
        explanation: string
    } | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(
                    `/api/differences?docStartName=${encodeURI("EBA GL")}`
                )
                const json = await res.json()
                setData(json)
            } catch (err) {
                console.error("Failed to load differences:", err)
            } finally {
                setLoaded(true)
            }
        }

        load()
    }, [])

    // Collect data from all files
    const overlaps = data.flatMap((d) => d.overlaps ?? [])
    const contradictions = data.flatMap((d) => d.contradictions ?? [])

    return (
        <div className="flex flex-col h-screen text-slate-100 bg-slate-800 overflow-scroll">
            {/* Header */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-b-2xl shadow-xl p-6 flex gap-4">
                <div className="w-full bg-slate-900/80 border-b border-slate-800 p-4 shadow-lg rounded-xl">
                    <DocumentSelector initial={"EBA"} />
                </div>
                <div
                    className="min-w-40 bg-slate-800 border border-emerald-300 rounded-xl
                flex flex-col items-center text-center text-emerald-300
                p-2 space-y-1 justify-center"
                >
                    <div className="text-red-300">Contradictions {contradictions.length}</div>
                    <div>Overlaps {overlaps.length}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full mx-auto p-6 space-y-6 max-w-[80vw]">
                {/* Summary */}

                {/* Contradictions */}
                {contradictions.length > 0 && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-red-400">
                            Contradictions
                        </h2>

                        {contradictions.map((c, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-red-300">
                                        Conflict #{idx + 1}
                                    </h3>

                                    <CompareButton
                                        setViewerData={setViewerData}
                                        c={c}
                                        isRed={true}
                                    />
                                </div>

                                <div className="text-sm space-y-4">
                                    <div>
                                        <p className="font-medium text-red-300">
                                            Excerpt 1 (page {c.pageNumber1})
                                        </p>
                                        <p className="text-slate-100 whitespace-pre-line">
                                            {c.excerpt1}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-red-300">
                                            Excerpt 2 (page {c.pageNumber2})
                                        </p>
                                        <p className="text-slate-100 whitespace-pre-line">
                                            {c.excerpt2}
                                        </p>
                                    </div>

                                    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                                        <p className="font-semibold text-red-300 mb-1">
                                            Explanation
                                        </p>
                                        <p className="text-slate-100 whitespace-pre-line">
                                            {c.explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Overlaps */}
                {overlaps.length > 0 && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-emerald-300">
                            Overlaps
                        </h2>

                        {overlaps.map((o, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-emerald-300">
                                        Overlap #{idx + 1}
                                    </h3>

                                    <CompareButton
                                        setViewerData={setViewerData}
                                        c={o}
                                    />
                                </div>

                                <div className="text-sm space-y-4">
                                    <div>
                                        <p className="font-medium text-emerald-300">
                                            Excerpt 1 (page {o.pageNumber1})
                                        </p>
                                        <p className="text-slate-100 whitespace-pre-line">
                                            {o.excerpt1}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-emerald-300">
                                            Excerpt 2 (page {o.pageNumber2})
                                        </p>
                                        <p className="text-slate-100 whitespace-pre-line">
                                            {o.excerpt2}
                                        </p>
                                    </div>

                                    {o.explanation && (
                                        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                                            <p className="font-semibold text-emerald-300 mb-1">
                                                Explanation
                                            </p>
                                            <p className="text-slate-100 whitespace-pre-line">
                                                {o.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {viewerData && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-scroll">
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-6xl space-y-4 mt-20">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-slate-200">
                                    Compare Documents
                                </h2>
                                <button
                                    onClick={() => setViewerData(null)}
                                    className="text-slate-300 hover:text-white text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 h-[70vh]">
                                <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-inner p-2">
                                    <LegalRendererDocument
                                        docName={viewerData.leftId}
                                        page={viewerData.leftPage}
                                        excerpt={viewerData.excerpt1}
                                        fileName={viewerData.filename1}
                                    />
                                </div>

                                <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-inner p-2">
                                    <LegalRendererDocument
                                        docName={viewerData.rightId}
                                        page={viewerData.rightPage}
                                        excerpt={viewerData.excerpt2}
                                        fileName={viewerData.filename2}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                                    Explanation
                                </h3>
                                <p className="text-slate-100 whitespace-pre-line">
                                    {viewerData.explanation}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ----------------------------
// Types for your pipeline API
// ----------------------------
export type PipelineResult = {
    summary: string
    overlaps: Overlap[]
    contradictions: Contradiction[]
}

export type Overlap = {
    id1: string
    id2: string
    excerpt1: string
    excerpt2: string
    pageNumber1: number
    pageNumber2: number
    filename1: string
    filename2: string
    explanation?: string
    type: "OVERLAP"
}

export type Contradiction = {
    id1: string
    id2: string
    excerpt1: string
    excerpt2: string
    pageNumber1: number
    pageNumber2: number
    filename1: string
    filename2: string
    explanation: string
    type: "CONTRADICTION"
}
