"use client"

import { useRouter } from "next/navigation"

type UserType = "user" | "ai"

type SingleChat = {
    user: UserType
    text: string
}

export default function Home() {
    const router = useRouter()

    return (
        <div className="flex flex-col h-screen text-slate-100 bg-slate-900/80 items-center text-center justify-center">
            <main className="flex min-h-screen w-full max-w-3xl flex-col py-16 px-6 gap-6 items-center justify-center">
                <h1 className="text-7xl font-bold">Legal conflict finder</h1>
                <button
                    className="text-emerald-300 text-6xl border border-emerald-300 p-4 rounded-4xl bg-slate-700"
                    type="button"
                    onClick={() => router.push("/ResultPage")}
                >
                    Go to list view
                </button>
                <button
                    className="text-emerald-300 text-6xl border border-emerald-300 p-4 rounded-4xl bg-slate-700"
                    type="button"
                    onClick={() => router.push("/ReaderPage")}
                >
                    Go to document view
                </button>
            </main>
        </div>
    )
}
