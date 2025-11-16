"use server"

import { NextResponse } from "next/server"
import OpenAI from "openai";

export type Difference = {
    filename1: string
    excerpt1: string
    pageNumber1: number
    filename2: string
    excerpt2: string
    pageNumber2: number
    explanation: string
    type: 'OVERLAP' | 'CONTRADICTION'
}

export type LegalDiffResponse = {
    summary: string
    overlaps: Difference[]
    contradictions: Difference[]
}

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const SYSTEM_PROMPT = `
You compare legal, regulatory, or compliance text segments. Your task is to identify ONLY two categories of findings: 
(1) true overlaps (divergent rules governing the SAME regulatory subject), or 
(2) true contradictions (rules that cannot both be complied with for the SAME regulatory subject).


STRICT DEFINITIONS:

1. SAME REGULATORY SUBJECT (mandatory condition)
   Two excerpts regulate the same subject ONLY IF ALL of the following are true:
   - They impose, modify, limit, or define obligations, rights, thresholds, conditions, prohibitions, exemptions, or procedures  
   - They apply to the SAME actor type (for example investment firms, trading venues, APAs, ARMs, CCPs, CSDs, etc.)  
   - They address the SAME regulatory action or requirement (for example order transparency, position limits, CCP access, commodity derivative exemption conditions, reporting obligations, trading venue functioning, etc.)  
   - They operate within the SAME functional context (for example pre-trade transparency, clearing obligation, data reporting, position reporting, trading venue operation, best execution, etc.)

   If ANY of these criteria is not met, you must treat the excerpts as regulating DIFFERENT subjects.

   DO NOT classify texts as overlapping merely because:
   - they are both in EU financial regulation,
   - they both concern transparency in general,
   - they both concern derivatives in general,
   - they both mention reporting,
   - they both concern trading venues,
   - they both relate to MiFID II or MiFIR,
   - they are part of the same regulatory package,
   - they share conceptual themes.

   Only rule-level, actor-specific, requirement-specific alignment counts.

2. OVERLAP
   An overlap exists when:
   - Both excerpts meet the SAME REGULATORY SUBJECT test above, AND
   - They impose definitions, procedures, conditions, timelines, thresholds, exemptions, responsibilities, or scopes, AND
   - These rules or limits same or almost the same.

3. CONTRADICTION
   A contradiction exists ONLY when:
   - Both excerpts meet the SAME REGULATORY SUBJECT test above, AND
   - The limits or rules are not the same, for example: they are mutually exclusive OR they are different but can both be complied with, AND
   - One text prescribes a fixed numerical threshold, limit, or maximum for the same regulatory action while the other grants discretionary power to the actor to define that threshold, and the prescribed fixed limit falls within the domain that the discretionary rule leaves open. In such cases the fixed numerical requirement must be treated as contradicting the discretionary formulation.

4. EXCLUDED CONTENT (never produces overlaps or contradictions)
   - Recitals or purpose statements unless BOTH excerpts impose concrete, actor-specific legal effects.
   - Do not consider table of contents, section headings, or titles.
   - Do not consider dates or version numbers.
   - Broad policy descriptions.
   - Legislative rationale (why the EU chose a Regulation or a Directive).
   - Statements about general harmonisation goals.
   - High-level descriptions of transparency.
   - References to market functioning in general.
   - Any text that does not impose specific operative requirements.

5. OUTPUT RULES
   - If no valid overlaps or contradictions are found under the strict definitions above, you MUST return:
       "summary": "",
       "overlaps": [],
       "contradictions": []
   - You MUST NOT fabricate overlaps based on thematic similarity.
   - You MUST NOT compare unrelated requirements.
   - You MUST NOT infer shared subjects beyond explicit textual evidence.

6. WHEN A FINDING IS VALID
   For each valid overlap or contradiction, quote the exact operative wording causing the divergence or conflict.

7. NEVER provide findings for unrelated subjects. 
   When in doubt about whether texts govern the same subject, default to treating them as DIFFERENT subjects and return no findings.

Your sole function is to detect ONLY rule-level divergences or conflicts on the EXACT SAME regulatory subject. All other comparisons, thematic links, or conceptual similarities must be ignored.
Tell the source and target document filenames as filename1 and filename2 in your response.
`


export async function findDifferences(query: string, sourcedocument: string, sourcePageNumber: number, message: string): Promise<LegalDiffResponse> {

    //const apiKey = process.env.OPENAI_API_KEY
    //if (!apiKey) throw new Error("Missing OPENAI_API_KEY")

    const completion = await openai.chat.completions.create({
        model: "gemini-2.5-pro",
        //reasoning_effort: "low",
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "LegalDiffResponse",
                strict: true,
                schema: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        summary: { type: "string" },
                        overlaps: {
                            type: "array",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    filename1: { type: "string" },
                                    excerpt1: { type: "string" },
                                    pageNumber1: { type: "number" },
                                    filename2: { type: "string" },
                                    excerpt2: { type: "string" },
                                    pageNumber2: { type: "number" },
                                    explanation: { type: "string" },
                                    type: {
                                        type: "string",
                                        enum: ["OVERLAP", "CONTRADICTION"],
                                    },
                                },
                                required: [
                                    "filename1",
                                    "excerpt1",
                                    "pageNumber1",
                                    "filename2",
                                    "excerpt2",
                                    "pageNumber2",
                                    "explanation",
                                    "type",
                                ],
                            },
                        },
                        contradictions: {
                            type: "array",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    filename1: { type: "string" },
                                    excerpt1: { type: "string" },
                                    pageNumber1: { type: "number" },
                                    filename2: { type: "string" },
                                    excerpt2: { type: "string" },
                                    pageNumber2: { type: "number" },
                                    explanation: { type: "string" },
                                    type: {
                                        type: "string",
                                        enum: ["OVERLAP", "CONTRADICTION"],
                                    },
                                },
                                required: [
                                    "filename1",
                                    "excerpt1",
                                    "pageNumber1",
                                    "filename2",
                                    "excerpt2",
                                    "pageNumber2",
                                    "explanation",
                                    "type",
                                ],
                            },
                        },
                    },
                    required: ["summary", "overlaps", "contradictions"],
                },
            },
        },
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: `Original content to be compared (filename ${sourcedocument}): ${query} (page ${sourcePageNumber}) 

Related content:
${message}`,
            },
        ],
    })

    const content = completion.choices[0]?.message?.content


    const parsed =
        typeof content === "string" ? JSON.parse(content) : content

    return parsed as LegalDiffResponse
}

export async function paragraphToVectorQuery(paragraph: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY")


    const completion = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
            {
                role: "system",
                content:
                    "You are an AI assistant that converts legal text paragraphs into concise vector search queries.",
            },
            {
                role: "user",
                content: `Convert the following legal text paragraph into a concise vector search query that captures its main topics and concepts:

"${paragraph}"

The query should be brief, focused, and suitable for retrieving relevant legal documents. Do not include the name of the regulation or any metadata, only the core content topics.`,
            },
        ],
    })

    const message = completion.choices[0]?.message?.content ?? "";


    return message
}