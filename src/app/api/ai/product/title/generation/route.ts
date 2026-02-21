import { NextRequest, NextResponse } from "next/server";
import { getAidcApiUrl } from "@/lib/aidc";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, targetLanguage = "en", keywords = "", category = [], description = "" } = body;

        if (!title) {
            return NextResponse.json({ error: "Missing source title." }, { status: 400 });
        }

        console.log(`[Aidge] Requesting title generation for: "${title}", Lang: ${targetLanguage}`);

        let apiUrl: string;
        try {
            apiUrl = getAidcApiUrl("/ai/product/title/generation");
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }

        let validCategory = category;
        if (!validCategory || (Array.isArray(validCategory) && validCategory.length === 0)) {
            validCategory = ["General"];
        }

        const payload = {
            productName: title,
            targetLanguage: targetLanguage,
            productCategory: validCategory,
            productKeyword: keywords ? String(keywords).split(',').map(k => k.trim()) : undefined,
            productDescription: description,
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-iop-trial": "true" // From user instructions: 如需试用，请添加'x-iop-trial:true'至header
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("[Aidge API Response]:", JSON.stringify(data, null, 2));
        if (data.code !== "0") {
            return NextResponse.json({ error: data.message || "Aidge API Error", details: data }, { status: response.status });
        }

        // Return the whole data payload to the frontend, frontend will parse it.
        return NextResponse.json({
            success: true,
            data: data.data.generatedTitle[0]
        });
    } catch (error: any) {
        console.error("Error generating title:", error);
        return NextResponse.json({ error: error.message || "Failed to generate title" }, { status: 500 });
    }
}
