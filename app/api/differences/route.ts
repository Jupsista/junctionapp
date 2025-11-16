import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const folderPath = path.join(process.cwd(), "data/differences")
        const files = fs.readdirSync(folderPath)
        const docStartName = searchParams.get("docStartName")

        if (!docStartName)
            return NextResponse.json(
                { error: "File not found!" },
                { status: 500 }
            )

        const payload = files
            .filter((f) => f.startsWith(docStartName))
            .map((f) => {
                const fullPath = path.join(folderPath, f)
                const raw = fs.readFileSync(fullPath, "utf8")
                return JSON.parse(raw)
            })

        return NextResponse.json(payload)
    } catch (err: any) {
        console.error("Error reading differences folder:", err)
        return NextResponse.json(
            { error: err.message ?? "Unknown error" },
            { status: 500 }
        )
    }
}
