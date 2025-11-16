"use client"

import LegalRenderer from "@/app/components/LegalRenderer"
import { useState } from "react"
import DocumentSelector from "@/app/components/DocumentSelector"

export default function Page() {
    const [docId, setDocId] = useState<string | null>(null)

    const [highlight, setHighlight] = useState<{
        text: string
        page: number
    }>()

    return (
        <div>
            <DocumentSelector onSelect={(id) => setDocId(id)} />
            {docId ? (
                <LegalRenderer
                    docId={docId}
                    initialPage={1}
                    onHighlight={(h) => setHighlight(h)}
                />
            ) : (
                <span>No document selected</span>
            )}

            <div className="mt-6">
                <h2 className="font-semibold mb-2">Selected Highlights</h2>
                <pre className="text-sm bg-gray-100 p-3 rounded">
                    {JSON.stringify(highlight, null, 2)}
                </pre>
            </div>
        </div>
    )
}
