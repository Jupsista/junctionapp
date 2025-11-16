"use server"

import { NextResponse } from "next/server";

type AiResponse = {
    id1: string
    excerpt1: string,
    pageNumber1: number,
    id2: string,
    excerpt2: string,
    pageNumber2: number,
    explanation: string
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const SYSTEM_PROMPT = `
You are an AI legal-text comparison assistant. Your role is to compare
two or more legal, regulatory, or compliance-related text segments and
identify differences ONLY when they exist.

Your responsibilities:

1. **Only Report Differences**
   - If no differences are found, don't return anything.
   - If differences exist, report ONLY those differences with the original {id}.

2. **Highlight the Original Text Segments**
   When presenting differences:
   - Quote the relevant original text causing the difference.
   - Highlight quotes using CLEAR MARKERS such as:
       **{document_id: "id"} …text from Document…**
       **{document_id: "id"} …text from Document…**
   - Make sure each text comparison shows exactly what differs.

3. **Difference Types to Detect**
   - Definition discrepancies
   - Procedural / requirement differences
   - Scope or applicability differences
   - Exceptions and exemptions
   - Thresholds, conditions, or timelines
   - Terminology / phrasing differences
   - Conflicts or incompatibilities

4. **Output Format**
   If differences are found, structure the output as:

   **Differences Found:**
   - **Type of difference:** (e.g., definition, requirement, threshold)
     - **Document {document_id: "id"}:** **original text excerpt**
     - **Document {document_id: "id"}:** **original text excerpt**
     - **Explanation:** Clear description of what is different.

5. **Rules**
   - Do not summarize similarities.
   - Do not summarize entire documents unless asked.
   - Do not offer legal advice; analyze only the text provided.
   - If the text is fragmentary or ambiguous, state that explicitly.

Your only goal is to identify genuine differences and show the exact
places in the original text where those differences appear.

Example of an overlap:
- Financial Supervisory Authority, Regulations and guidelines 4/2018, Section 4.4.2 (44): “Supervised entities must ensure that the valuation of acceptable collateral is based on reliable appraisal methods, taking internationally recognised valuation standards into account.”
- EBA/GL/2020/06 (207): “Institutions should ensure that the property collateral is valued in accordance with applicable international, European and national standards, such as the International Valuation Standards Council, the European Group of Valuers’ Associations European Valuation Standards and the Royal Institution of Chartered Surveyors standards.”

No contradiction, just an overlap: The latter text gives some examples of internationally recognized valuation standards.

Example of a contradiction:
- EBA/GL/2020/06 (235): “Institutions should ensure an adequate rotation of valuers and define the number of sequential individual valuations of the same property that can be performed by the same valuer. Any further revaluations beyond this number should result in the rotation of the valuer, resulting in the appointment of either a different internal valuer or a different external valuer.”
- EBA/GL/2018/06 (196): “Credit institutions should ensure adequate rotation of appraisers, i.e. two sequential individual valuations of the immovable property by the same appraiser should result in the rotation of the appraiser, resulting in the appointment of either a different internal appraiser or a different external appraisal provider.”

In the latter Guidelines, the same appraiser may valuate a given item no more than twice consecutively, whereas the former Guidelines allows the bank itself to define the adequate rotation of valuers.
`;

    // const apiKey = process.env.FEATHERLESS_API_KEY;
    // if (!apiKey) throw new Error("Missing FEATHERLESS_API_KEY");

    console.log("sending...")
    // const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${apiKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    //     messages: [
    //       { role: "system", content: SYSTEM_PROMPT },
    //       { role: "user", content: message },
    //     ],
    //   }),
    // });


    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "LegalDiff",
                schema: {
                    type: "object",
                    properties: {
                        id1: {"type": "string"},
                        excerpt1: {"type": "string"},
                        pageNumber1: {"type": "number"},
                        id2: {"type": "string"},
                        excerpt2: {"type": "string"},
                        pageNumber2: {"type": "number"},
                        explanation: {"type": "string"}
                    },
                    required: ["id1", "excerpt1", "id2", "excerpt2", "explanation"]
                }
            }
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      }),
    });

    const json = await response.json();
    console.log("json", json)

    return NextResponse.json({
      content: json.choices?.[0]?.message?.content ?? "",
    });
  } catch (err: any) {
    console.error("AI Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
