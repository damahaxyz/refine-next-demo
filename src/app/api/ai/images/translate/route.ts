import { NextRequest, NextResponse } from "next/server";
import path from "path";
import alimt20181012, * as $alimt20181012 from '@alicloud/alimt20181012';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { imageUrl, productId, sourceLanguage = "zh", targetLanguage = "en", useImageEditor = true } = body;

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

        console.log(`[Aliyun MT] Requesting image translation for: "${imageUrl}", TargetLang: ${targetLanguage}`);

        const accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
        const accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
        const endpoint = process.env.ALIBABA_CLOUD_ENDPOINT || 'mt.ap-southeast-1.aliyuncs.com';

        if (!accessKeyId || !accessKeySecret) {
            return NextResponse.json({ error: "Aliyun credentials missing." }, { status: 500 });
        }

        let config = new $OpenApi.Config({
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret,
        });
        config.endpoint = endpoint;

        let client = new alimt20181012(config);

        let translateImageRequest = new $alimt20181012.TranslateImageRequest({
            imageUrl: imageUrl,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            ext: useImageEditor ? JSON.stringify({ needEditorData: "true" }) : undefined
        });

        let runtime = new $Util.RuntimeOptions({
            readTimeout: 60000,
            connectTimeout: 60000,
            autoretry: true,
            maxAttempts: 3
        });

        let resp = await client.translateImageWithOptions(translateImageRequest, runtime);
        console.log("[Aliyun MT API Response]:", JSON.stringify(resp, null, 2));

        if (!resp || !resp.body) {
            return NextResponse.json({ error: "Empty response from Aliyun API" }, { status: 500 });
        }

        if (resp.body.code !== 200) {
            return NextResponse.json({ error: resp.body.message || "Aliyun API Error", details: resp.body }, { status: 500 });
        }

        const translatedUrl = resp.body.data?.finalImageUrl;
        const editorRestore = resp.body.data?.templateJson;

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
                url: newUrl,
                editorSchema: editorRestore || ""
            }
        });
    } catch (error: any) {
        console.error("Error translating image via Aliyun MT:", error);
        return NextResponse.json({ error: error.message || "Failed to translate image" }, { status: 500 });
    }
}
