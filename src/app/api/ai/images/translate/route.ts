import { NextRequest, NextResponse } from "next/server";
import { getAidcApiUrl } from "@/lib/aidc";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { imageUrl, productId, sourceLanguage = "zh", targetLanguage = "en", translatingBrandInTheProduct = "false", useImageEditor = "false" } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: "Missing imageUrl." }, { status: 400 });
        }

        // Deal with relative URLs (e.g. from local storage)
        if (imageUrl.startsWith("/")) {
            imageUrl = `https://erp.tikool.com${imageUrl}`;
        }
        if (!productId) {
            return NextResponse.json({ error: "Missing productId." }, { status: 400 });
        }

        console.log(`[Aidge] Requesting image translation for: "${imageUrl}", TargetLang: ${targetLanguage}`);

        let apiUrl: string;
        try {
            apiUrl = getAidcApiUrl("/ai/image/translation_mllm");
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }

        const paramJson = {
            imageUrl,
            sourceLanguage,
            targetLanguage,
            translatingBrandInTheProduct,
            useImageEditor
        };

        const payload = {
            paramJson: JSON.stringify(paramJson)
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-iop-trial": "true"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("[Aidge Image Translation API Response]:", JSON.stringify(data, null, 2));

        if (data.code !== "0") {
            return NextResponse.json({ error: data.message || "Aidge API Error", details: data }, { status: response.status });
        }

        const translatedUrl = data?.imageResultList?.[0]?.result_list?.[0]?.fileUrl;

        if (!translatedUrl) {
            return NextResponse.json({ error: "No translated image URL found in response." }, { status: 500 });
        }

        // Fetch the temporary image URL and save it locally
        const imageRes = await fetch(translatedUrl);
        if (!imageRes.ok) {
            return NextResponse.json({ error: "Failed to download translated image." }, { status: 500 });
        }

        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract extension from the translated URL or default to .jpg
        const matchExt = translatedUrl.match(/\.([^.?]+)(\?.*)?$/);
        const ext = matchExt ? matchExt[1]?.toLowerCase() : "jpg";

        const filename = `${Date.now()}_translated.${ext}`;
        const saveDir = path.join(process.cwd(), "public", "products", productId);

        const fs = await import("fs/promises");
        await fs.mkdir(saveDir, { recursive: true });

        const savePath = path.join(saveDir, filename);
        await fs.writeFile(savePath, buffer);

        const newUrl = `/products/${productId}/${filename}`;

        return NextResponse.json({
            success: true,
            data: {
                url: newUrl
            }
        });
    } catch (error: any) {
        console.error("Error translating image:", error);
        return NextResponse.json({ error: error.message || "Failed to translate image" }, { status: 500 });
    }
}
