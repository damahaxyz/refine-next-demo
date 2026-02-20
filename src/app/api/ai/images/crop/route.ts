import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageUrl, productId, scale, position, cropBox, container } = body;

        if (!imageUrl || !productId || !cropBox || !container) {
            return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
        }

        let buffer: Buffer;

        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            // External image URL, download it
            const res = await fetch(imageUrl);
            if (!res.ok) {
                return NextResponse.json({ success: false, error: "Failed to fetch remote image" }, { status: 400 });
            }
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else if (imageUrl.startsWith("/")) {
            // Local image path
            const localPath = path.join(process.cwd(), "public", imageUrl);
            try {
                buffer = await fs.readFile(localPath);
            } catch (err) {
                return NextResponse.json({ success: false, error: "Local image not found" }, { status: 404 });
            }
        } else {
            return NextResponse.json({ success: false, error: "Invalid image URL format" }, { status: 400 });
        }

        const image = sharp(buffer);
        const metadata = await image.metadata();
        const imgW = metadata.width || 0;
        const imgH = metadata.height || 0;

        if (!imgW || !imgH) {
            return NextResponse.json({ success: false, error: "Invalid image format" }, { status: 400 });
        }

        // Calculate image screen bounds based on flex origin-center
        const imageScreenLeft = container.width / 2 + position.x - (imgW * scale) / 2;
        const imageScreenTop = container.height / 2 + position.y - (imgH * scale) / 2;

        // Calculate coordinates relative to original image
        let cropX = (cropBox.x - imageScreenLeft) / scale;
        let cropY = (cropBox.y - imageScreenTop) / scale;
        let cropW = cropBox.width / scale;
        let cropH = cropBox.height / scale;

        // Clamp values to stay within image bounds
        cropX = Math.max(0, cropX);
        cropY = Math.max(0, cropY);
        if (cropX + cropW > imgW) cropW = imgW - cropX;
        if (cropY + cropH > imgH) cropH = imgH - cropY;

        // Round to integers as required by Sharp
        cropX = Math.round(cropX);
        cropY = Math.round(cropY);
        cropW = Math.round(cropW);
        cropH = Math.round(cropH);

        // Fail-safe
        if (cropW <= 0 || cropH <= 0 || cropX >= imgW || cropY >= imgH) {
            return NextResponse.json({ success: false, error: "Crop box is outside the image bounds" }, { status: 400 });
        }

        // Perform the crop
        const croppedBuffer = await image
            .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
            .toBuffer();

        // Save
        const filename = `${Date.now()}_crop.png`;
        const saveDir = path.join(process.cwd(), "public", "products", productId);
        await fs.mkdir(saveDir, { recursive: true });

        const savePath = path.join(saveDir, filename);
        await fs.writeFile(savePath, croppedBuffer);

        const newUrl = `/products/${productId}/${filename}`;

        return NextResponse.json({ success: true, data: { url: newUrl } });
    } catch (error: any) {
        console.error("Crop API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
