import { NextResponse } from "next/server"
import { Pool } from "pg"

// Create a global pool to avoid exhausting connections during hot reload
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const docId = searchParams.get("docId")
    const page = searchParams.get("page")

    if (!docId || !page) {
        return NextResponse.json(
            { error: "Missing required query params: docId & page" },
            { status: 400 }
        )
    }

    console.log(docId, page)

    try {
        // Query: find the row where file_path contains the doc folder AND matches page number
        const query = `
      SELECT id, file_path, page, content
      FROM pages
      WHERE file_path LIKE $1 || '%'
      AND page = $2::int
      LIMIT 1;
    `;
        const values = [docId, page]
        console.log(query, values);

        const result = await pool.query(query, values)

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: `Page ${page} not found in document ${docId}` },
                { status: 404 }
            )
        }

        const row = result.rows[0]

        return NextResponse.json({
            id: row.id,
            docId,
            page: row.page,
            content: row.content,
            filePath: row.file_path,
        })
    } catch (err: any) {
        console.error("Database error:", err)
        return NextResponse.json(
            { error: "Failed to load document", message: err.message },
            { status: 500 }
        )
    }
}
