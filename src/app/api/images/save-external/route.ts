import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { url, base64, productId } = await req.json();

        if (!url && !base64) {
            return NextResponse.json({ error: "Missing url or base64 parameter" }, { status: 400 });
        }
        if (!productId) {
            return NextResponse.json({ error: "Missing productId parameter for saving" }, { status: 400 });
        }

        let buffer: Buffer;
        let ext = "jpg";

        if (base64) {
            const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                if (contentType.includes("png")) ext = "png";
                else if (contentType.includes("webp")) ext = "webp";
                else if (contentType.includes("jpeg")) ext = "jpg";
                buffer = Buffer.from(matches[2], 'base64');
            } else {
                buffer = Buffer.from(base64, 'base64');
            }
        } else {
            // Fetch the external image
            const imgRes = await fetch(url);
            if (!imgRes.ok) {
                throw new Error(`Failed to fetch external image: ${imgRes.statusText}`);
            }

            buffer = Buffer.from(await imgRes.arrayBuffer());
            const contentType = imgRes.headers.get("content-type");
            if (contentType) {
                if (contentType.includes("png")) ext = "png";
                else if (contentType.includes("webp")) ext = "webp";
            } else {
                const urlExt = url.split('.').pop()?.split('?')[0]?.toLowerCase();
                if (urlExt && ['png', 'jpg', 'jpeg', 'webp'].includes(urlExt)) {
                    ext = urlExt === 'jpeg' ? 'jpg' : urlExt;
                }
            }
        }



        const filename = `${Date.now()}_edited.${ext}`;
        const saveDir = path.join(process.cwd(), "public", "products", productId);

        // Ensure directory exists
        await fs.mkdir(saveDir, { recursive: true });

        const savePath = path.join(saveDir, filename);
        await fs.writeFile(savePath, buffer);

        const newUrl = `/products/${productId}/${filename}`;

        return NextResponse.json({ url: newUrl });
    } catch (e: any) {
        console.error("Error saving external image:", e);
        return NextResponse.json({ error: e.message || "Failed to save external image" }, { status: 500 });
    }
}
