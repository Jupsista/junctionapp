"use server";

import { findDifferences, paragraphToVectorQuery } from "@/app/functions/openai-functions";
import { vectorFilter } from "@/app/functions/vectorfilter";
import { vectorSearch } from "@/app/functions/vectorsearch";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {query, sourcePageNumber, document} = body;

        const vectorQuery = await paragraphToVectorQuery(query);
        console.log("Vector query generated", vectorQuery);
        const vectorSearchResult = await vectorSearch(vectorQuery);
        console.log("Vector search completed", vectorSearchResult.value.length);
        const filteredResult = vectorFilter(document, vectorSearchResult);
        console.log("Vector filtering completed", filteredResult.value.length);
        let total = 0;
        let longest = 0;
        for (const doc of filteredResult.value) {
            total += doc.content.length;
            if (doc.content.length > longest) {
                longest = doc.content.length;
            }
        }

        const diff = await findDifferences(query, document,sourcePageNumber,JSON.stringify(filteredResult));

        return NextResponse.json(diff);
    } catch (err: any) {
        console.error("Search error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}



