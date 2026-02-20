import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, targetLanguage = "en", keywords = "", category = [], description = "" } = body;

        if (!title) {
            return NextResponse.json({ error: "Missing source title." }, { status: 400 });
        }

        // The user provided AIDGE_API_KEY might mean AppKey, let's look for both AppKey and AppSecret.
        // For backwards compatibility with the previous step, if only AIDGE_API_KEY is defined, 
        // we prompt the user or fallback.
        const appKey = process.env.AIDGE_APP_KEY || process.env.AIDGE_API_KEY;
        const appSecret = process.env.AIDGE_APP_SECRET || process.env.AIDGE_API_KEY;

        if (!appKey || !appSecret) {
            return NextResponse.json({ error: "API credentials (AIDGE_APP_KEY and AIDGE_APP_SECRET) are not fully configured in .env." }, { status: 500 });
        }

        console.log(`[Aidge] Requesting title generation for: "${title}", Lang: ${targetLanguage}`);

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

        const timestamp = Date.now().toString();
        // sign = HmacSHA256(secret+timestamp, secret).toUpperCase()
        const signString = `${appSecret}${timestamp}`;
        const signature = crypto.createHmac('sha256', appSecret).update(signString).digest('hex').toUpperCase();

        const baseUrl = "https://cn-api.aidc-ai.com/rest";
        const apiPath = "/ai/product/title/generation"; // Assuming this is the 'api name' path but keeping rest structure

        // As per documentation curl example: 'https://[api domain]/rest[api name]?partner_id=aidge&sign_method=sha256&sign_ver=v2&app_key=[you api key name]&timestamp=[timestamp]&sign=[sha256 sign]'
        const apiUrl = `${baseUrl}${apiPath}?partner_id=aidge&sign_method=sha256&sign_ver=v2&app_key=${appKey}&timestamp=${timestamp}&sign=${signature}`;

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
