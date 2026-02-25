import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";
import imageenhan20190930, * as $imageenhan20190930 from '@alicloud/imageenhan20190930';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageUrl, productId, model = "ultrasharp-4x", width } = body;

        if (!imageUrl || !productId) {
            return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
        }

        let buffer: Buffer;

        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            const res = await fetch(imageUrl);
            if (!res.ok) {
                return NextResponse.json({ success: false, error: "Failed to fetch remote image" }, { status: 400 });
            }
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else if (imageUrl.startsWith("/")) {
            const localPath = path.join(process.cwd(), "public", imageUrl);
            try {
                buffer = await fs.readFile(localPath);
            } catch (err) {
                return NextResponse.json({ success: false, error: "Local image not found" }, { status: 404 });
            }
        } else {
            return NextResponse.json({ success: false, error: "Invalid image URL format" }, { status: 400 });
        }

        // Write to temporary input file
        const tmpId = crypto.randomUUID();
        const tmpIn = path.join(process.cwd(), "public", `tmp_in_${tmpId}.png`);
        const tmpOut = path.join(process.cwd(), "public", `tmp_out_${tmpId}.png`);

        await fs.writeFile(tmpIn, buffer);

        // Determine platform-specific binary
        const isLinux = process.platform === "linux";
        const binName = isLinux ? "upscayl-bin-linux" : "upscayl-bin-mac";
        const binPath = path.join(process.cwd(), "src", "lib", "upscayl", binName);
        const modelsPath = path.join(process.cwd(), "src", "lib", "upscayl", "models");

        // Execute Upscayl binary
        // -i: input file
        // -o: output file
        // -m: models path
        // -n: model name
        let command = `"${binPath}" -i "${tmpIn}" -o "${tmpOut}" -m "${modelsPath}" -n ${model}`;

        if (width && !isNaN(width)) {
            command += ` -w ${width}`;
        }

        let upscaylSuccess = false;
        try {
            await execAsync(command);
            upscaylSuccess = true;
        } catch (execError: any) {
            console.warn("Upscayl binary failed, falling back to sharp:", execError.message);
        }

        // Fallback: If Upscayl failed, try Aliyun Image Enhancement first
        if (!upscaylSuccess) {
            let aliyunSuccess = false;

            // Need public URL for Aliyun API. If local, construct full URL
            let aliyunImageUrl = imageUrl;
            if (imageUrl.startsWith("/")) {
                aliyunImageUrl = `https://erp.tikool.com${imageUrl}`;
            }

            const accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
            const accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
            const endpoint = 'imageenhan.cn-shanghai.aliyuncs.com'; // Standard endpoint for this service

            if (accessKeyId && accessKeySecret) {
                try {
                    console.log(`[Aliyun Upscale] Attempting API for: ${aliyunImageUrl}`);
                    let config = new $OpenApi.Config({
                        accessKeyId: accessKeyId,
                        accessKeySecret: accessKeySecret,
                        endpoint: endpoint,
                    });

                    let client = new imageenhan20190930(config);

                    let makeSuperResolutionImageRequest = new $imageenhan20190930.MakeSuperResolutionImageRequest({
                        url: aliyunImageUrl,
                    });

                    let runtime = new $Util.RuntimeOptions({
                        readTimeout: 60000,
                        connectTimeout: 60000,
                        autoretry: true,
                        maxAttempts: 3
                    });

                    let resp = await client.makeSuperResolutionImageWithOptions(makeSuperResolutionImageRequest, runtime);
                    console.log("[Aliyun Upscale API Response]:", JSON.stringify(resp, null, 2));

                    if (resp?.body?.data?.url) {
                        const enhancedUrl = resp.body.data.url;
                        const imageRes = await fetch(enhancedUrl);
                        if (!imageRes.ok) throw new Error("Failed to download enhanced image from Aliyun");

                        const arrayBuffer = await imageRes.arrayBuffer();
                        const enhancedBuffer = Buffer.from(arrayBuffer);

                        // Overwrite tmpOut with Aliyun result
                        await fs.writeFile(tmpOut, enhancedBuffer);
                        aliyunSuccess = true;
                    }
                } catch (aliyunError: any) {
                    console.warn("[Aliyun Upscale] API failed:", aliyunError.message);
                }
            } else {
                console.warn("[Aliyun Upscale] Missing credentials, skipping Aliyun fallback.");
            }

            // Final Fallback: sharp resize if Aliyun also failed (or bypassed)
            if (!aliyunSuccess) {
                console.log("[Sharp Upscale] Falling back to standard lanczos3 resize.");
                try {
                    const sharp = (await import("sharp")).default;
                    const metadata = await sharp(tmpIn).metadata();
                    const targetWidth = (width && !isNaN(width)) ? Number(width) : (metadata.width || 800) * 2;
                    await sharp(tmpIn)
                        .resize(targetWidth, null, {
                            kernel: "lanczos3",
                            withoutEnlargement: false,
                        })
                        .png()
                        .toFile(tmpOut);
                } catch (sharpError: any) {
                    console.error("Sharp fallback also failed:", sharpError);
                    await fs.unlink(tmpIn).catch(() => { });
                    return NextResponse.json({ success: false, error: "Image upscaling failed completely: " + sharpError.message }, { status: 500 });
                }
            }
        }

        // Read output and move to final destination
        const filename = `${Date.now()}_upscaled.png`;
        const saveDir = path.join(process.cwd(), "public", "products", productId);
        await fs.mkdir(saveDir, { recursive: true });

        const savePath = path.join(saveDir, filename);
        await fs.rename(tmpOut, savePath);

        // Cleanup original input
        await fs.unlink(tmpIn).catch(() => { });

        const newUrl = `/products/${productId}/${filename}`;

        return NextResponse.json({ success: true, data: { url: newUrl } });
    } catch (error: any) {
        console.error("Upscayl API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
