import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, targetLanguage = "en", sourceLanguage } = body;

        if (!text) {
            return NextResponse.json({ error: "Missing source text." }, { status: 400 });
        }

        const appKey = process.env.AIDGE_APP_KEY || process.env.AIDGE_API_KEY;
        const appSecret = process.env.AIDGE_APP_SECRET || process.env.AIDGE_API_KEY;

        if (!appKey || !appSecret) {
            return NextResponse.json({ error: "API credentials (AIDGE_APP_KEY and AIDGE_APP_SECRET) are not fully configured in .env." }, { status: 500 });
        }

        console.log(`[Aidge] Requesting translation for text, Lang: ${targetLanguage}`);

        const textArray = Array.isArray(text) ? text : [text];

        const payload: Record<string, any> = {
            text: JSON.stringify(textArray), // The API expects a stringified JSON array
            targetLanguage: targetLanguage,
            formatType: "text"
        };

        if (sourceLanguage) {
            payload.sourceLanguage = sourceLanguage;
        }

        const timestamp = Date.now().toString();
        // sign = HmacSHA256(secret+timestamp, secret).toUpperCase()
        const signString = `${appSecret}${timestamp}`;
        const signature = crypto.createHmac('sha256', appSecret).update(signString).digest('hex').toUpperCase();

        const baseUrl = "https://cn-api.aidc-ai.com/rest";
        const apiPath = "/ai/text/marco/translator";

        const apiUrl = `${baseUrl}${apiPath}?partner_id=aidge&sign_method=sha256&sign_ver=v2&app_key=${appKey}&timestamp=${timestamp}&sign=${signature}`;

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
