import { NextRequest, NextResponse } from "next/server";
import { getAidcApiUrl } from "@/lib/aidc";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, pcate_leaf_name, properties = [], targetLanguage = "en" } = body;

        if (!title) {
            return NextResponse.json({ error: "Missing product title." }, { status: 400 });
        }
        if (!pcate_leaf_name || !Array.isArray(pcate_leaf_name)) {
            return NextResponse.json({ error: "Missing or invalid pcate_leaf_name." }, { status: 400 });
        }

        console.log(`[Aidge] Requesting keyword generation for: ${title}`);

        let apiUrl: string;
        try {
            apiUrl = getAidcApiUrl("/ai/text/smb/product/keyword");
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }

        const payload: Record<string, any> = {
            paramJson: JSON.stringify({
                title,
                pcate_leaf_name,
                properties,
                targetLanguage
            })
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-iop-trial": "true" // Optional based on account
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("[Aidge Keyword Generation API Response]:", JSON.stringify(data, null, 2));

        if (data.resCode !== 200) {
            return NextResponse.json({ error: data.resMessage || "Aidge API Error", details: data }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            data: data.data.result.data.structData.keyword
        });
    } catch (error: any) {
        console.error("Error generating keywords:", error);
        return NextResponse.json({ error: error.message || "Failed to generate keywords" }, { status: 500 });
    }
}
