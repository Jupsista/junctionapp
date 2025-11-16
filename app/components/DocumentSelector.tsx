"use client"

import { useState } from "react"

type Doc = {
    short: string
    long: string
}

const docs: Doc[] = [
    {
        short: "Basel",
        long: "Basel Committee on Banking Supervision regulatory framework.",
    },
    {
        short: "BRRD",
        long: "Bank Recovery and Resolution Directive — EU bank crisis management rules.",
    },
    {
        short: "CRD",
        long: "Capital Requirements Directive — prudential supervision requirements.",
    },
    {
        short: "CRR",
        long: "Capital Requirements Regulation — direct EU regulation on capital rules.",
    },
    {
        short: "EBA",
        long: "European Banking Authority guidelines and technical standards.",
    },
    { short: "EU", long: "General EU legislation and directives." },
    {
        short: "FIVA_MOK",
        long: "Finnish Financial Supervisory Authority (FIVA) regulations and guidelines.",
    },
    { short: "IFRS", long: "International Financial Reporting Standards." },
    {
        short: "LLL",
        long: "Legislation related to lending, liquidity, or leverage limits.",
    },
    {
        short: "MiFID",
        long: "Markets in Financial Instruments Directive — EU investment services rules.",
    },
    {
        short: "MiFIR",
        long: "Markets in Financial Instruments Regulation — EU trading & transparency rules.",
    },
    { short: "pages", long: "General page-indexed document sets." },
    {
        short: "SFDR",
        long: "Sustainable Finance Disclosure Regulation — ESG transparency obligations.",
    },
    {
        short: "VYL",
        long: "Finnish credit institutions and financial regulation documents.",
    },
]

interface Props {
    onSelect?: (docId: string) => void
    initial?: string
}

export default function DocumentSelector({ onSelect, initial }: Props) {
    const [selected, setSelected] = useState<Doc | null>(docs.find((d) => d.short === initial) || null)

    const handleChange = (value: string) => {
        const doc = docs.find((d) => d.short === value) || null
        setSelected(doc)
        if (onSelect && doc) onSelect(doc.short)
    }

    return (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-4 space-y-2 mb-2">
            {/* Header */}
            <h2 className="text-lg font-semibold text-slate-200">
                Select source document corpus <span className="text-red-500">(NOTE: currently only EBA indexed)</span>
            </h2>

            {/* Dropdown */}
            <div className="flex flex-col gap-2">
                <select
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm
                     text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    defaultValue="EBA"
                    onChange={(e) => handleChange(e.target.value)}
                >
                    <option value="" disabled>
                        Choose a document set…
                    </option>

                    {docs.map((doc) => (
                        <option key={doc.short} value={doc.short}>
                            {doc.short}
                        </option>
                    ))}
                </select>

                <p className="text-xs text-slate-400">
                    Select which regulatory or legislative source you want to
                    browse.
                </p>
            </div>

            {/* Explainer box */}
            {selected && (
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        {selected.short}
                    </p>
                    <p className="text-slate-100 text-sm leading-relaxed">
                        {selected.long}
                    </p>
                </div>
            )}
        </section>
    )
}
