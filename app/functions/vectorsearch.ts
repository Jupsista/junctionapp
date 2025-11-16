"use server";

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

export async function vectorSearch(query: string): Promise<RegPagesSearchResponse> {

    // Azure Search endpoint and key
    const endpoint =
        "https://junction-ai-search-test.search.windows.net/indexes/reg-pages-index/docs/search?api-version=2016-09-01";

    const apiKey = process.env.AZURE_SEARCH_KEY; // move key to env variable

    const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey as string,
            Accept: "*/*"
        },
        body: JSON.stringify({
            count: true,
            skip: 0,
            top: 150,
            searchMode: "any",
            queryType: "simple",
            search: query
        })
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Azure Search error: ${resp.status} ${text}`);
    }

    const result = await resp.json();

    // Return the search results, but clean the file paths
    const cleanedResults = result.value.map((doc: RegPagesDocument) => ({
        "@search.score": doc["@search.score"],
        page: doc.page,
        content: doc.content,
        filename: doc.filename.replace(/^.*[\\/]/, '') // Remove directory path
    }));
    result.value = cleanedResults;
    // sort by score descending
    result.value.sort((a: RegPagesDocument, b: RegPagesDocument) => b["@search.score"] - a["@search.score"]);
    return result;
}