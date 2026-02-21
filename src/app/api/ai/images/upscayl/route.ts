import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

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

        // Fallback to sharp if upscayl fails (e.g. no GPU)
        if (!upscaylSuccess) {
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
                return NextResponse.json({ success: false, error: "Image upscaling failed: " + sharpError.message }, { status: 500 });
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
