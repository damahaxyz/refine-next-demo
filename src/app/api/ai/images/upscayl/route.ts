import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

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

        // Determine original extension
        const urlStr = imageUrl.startsWith("http") ? imageUrl : `http://localhost${imageUrl}`;
        let ext = path.extname(new URL(urlStr).pathname).toLowerCase();
        if (!ext) ext = ".png"; // Default fallback

        // Write to temporary input file
        const tmpId = crypto.randomUUID();
        const tmpIn = path.join(process.cwd(), "public", `tmp_in_${tmpId}${ext}`);
        const tmpOut = path.join(process.cwd(), "public", `tmp_out_${tmpId}.png`); // Upscayl usually outputs PNG

        await fs.writeFile(tmpIn, buffer);

        let upscaylSuccess = false;

        // 1. Try to ping the local proxy first (e.g., Mac via SSH tunnel)
        let useProxy = false;
        try {
            const pingRes = await fetch("http://127.0.0.1:3001/ping", { method: "GET", signal: AbortSignal.timeout(2000) });
            if (pingRes.ok) {
                useProxy = true;
                console.log("[Upscayl] Local proxy detected at 127.0.0.1:3001");
            }
        } catch (e) {
            console.log("[Upscayl] Local proxy not reachable.");
        }

        if (useProxy) {
            try {
                const formData = new FormData();
                let mimeType = "image/png";
                if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
                if (ext === ".webp") mimeType = "image/webp";

                const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
                formData.append("image", blob, `tmp_in_${tmpId}${ext}`);
                formData.append("model", model);
                if (width && !isNaN(width)) {
                    formData.append("width", width.toString());
                }

                console.log("[Upscayl] Forwarding image to local proxy...");
                const proxyRes = await fetch("http://127.0.0.1:3001/upscayl", {
                    method: "POST",
                    body: formData,
                    // No timeout here because upscaling takes time
                });

                if (proxyRes.ok) {
                    const arrayBuffer = await proxyRes.arrayBuffer();
                    await fs.writeFile(tmpOut, Buffer.from(arrayBuffer));
                    upscaylSuccess = true;
                    console.log("[Upscayl] Proxy successfully upscaled the image.");
                } else {
                    console.warn(`[Upscayl] Proxy failed with status: ${proxyRes.status}`);
                    const errText = await proxyRes.text();
                    console.warn(`[Upscayl] Proxy error: ${errText}`);
                }
            } catch (e: any) {
                console.warn("[Upscayl] Error calling proxy:", e.message);
            }
        }

        // 2. Fallback: sharp resize if proxy failed
        if (!upscaylSuccess) {
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

        // Read output and move to final destination
        const filename = `${Date.now()}_upscaled.png`;
        const saveDir = path.join(process.cwd(), "public", "products", productId);
        await fs.mkdir(saveDir, { recursive: true });

        const savePath = path.join(saveDir, filename);
        await fs.rename(tmpOut, savePath);

        // Cleanup original input
        await fs.unlink(tmpIn).catch(() => { });

        const newUrl = `/products/${productId}/${filename}`;

        return NextResponse.json({ success: true, data: { url: newUrl, type: upscaylSuccess ? "upscayl" : "sharp" } });
    } catch (error: any) {
        console.error("Upscayl API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
