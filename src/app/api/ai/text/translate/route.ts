import { NextRequest, NextResponse } from "next/server";
import { getAidcApiUrl } from "@/lib/aidc";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, targetLanguage = "en", sourceLanguage } = body;

        if (!text) {
            return NextResponse.json({ error: "Missing source text." }, { status: 400 });
        }

        console.log(`[Aidge] Requesting translation for text, Lang: ${targetLanguage}`);

        let apiUrl: string;
        try {
            apiUrl = getAidcApiUrl("/ai/text/marco/translator");
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }

        const textArray = Array.isArray(text) ? text : [text];

        const payload: Record<string, any> = {
            text: JSON.stringify(textArray), // The API expects a stringified JSON array
            targetLanguage: targetLanguage,
            formatType: "text"
        };

        if (sourceLanguage) {
            payload.sourceLanguage = sourceLanguage;
        }

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-iop-trial": "true"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("[Aidge Translation API Response]:", JSON.stringify(data, null, 2));

        if (data.code !== "0") {
            return NextResponse.json({ error: data.message || "Aidge API Error", details: data }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            data: data.data.translations[0].translatedText // Depending on if it translates multiple array inputs or single string, here we return the first for simplicity or handle array response
        });
    } catch (error: any) {
        console.error("Error translating text:", error);
        return NextResponse.json({ error: error.message || "Failed to translate text" }, { status: 500 });
    }
}
