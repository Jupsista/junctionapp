"use server";

import { vectorSearch } from "@/app/functions/vectorsearch";
import { NextResponse } from "next/server";
export interface RegPagesDocument {
    "@search.score": number;
    id: string;
    filename: string;
    page: number;
    content: string;
}

export interface RegPagesSearchResponse {
    "@odata.context": string;
    "@odata.count"?: number;
    value: RegPagesDocument[];
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result = await vectorSearch(body.query);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Search error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
