
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-db";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Fetch Shop Details to get credentials
        const shop = await prisma.shop.findUnique({
            where: { id },
        });

        if (!shop) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 });
        }

        if (!shop.url || !shop.apiKey || !shop.apiSecret) {
            return NextResponse.json({ error: "Shop credentials missing" }, { status: 400 });
        }

        // 2. Prepare WooCommerce API calls
        // Basic Auth: base64(consumer_key:consumer_secret)
        const auth = Buffer.from(`${shop.apiKey}:${shop.apiSecret}`).toString("base64");
        const headers = {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json",
        };

        const baseUrl = shop.url.endsWith("/") ? shop.url.slice(0, -1) : shop.url;
        const categoriesUrl = `${baseUrl}/wp-json/wc/v3/products/categories?per_page=100`;
        const tagsUrl = `${baseUrl}/wp-json/wc/v3/products/tags?per_page=100`;

        // 3. Fetch Data in Parallel
        const [categoriesRes, tagsRes] = await Promise.all([
            fetch(categoriesUrl, { headers }),
            fetch(tagsUrl, { headers }),
        ]);

        if (!categoriesRes.ok || !tagsRes.ok) {
            console.error("WooCommerce API Error", {
                catStatus: categoriesRes.status,
                tagStatus: tagsRes.status,
            });
            return NextResponse.json({ error: "Failed to fetch data from WooCommerce" }, { status: 502 });
        }

        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();

        // 4. Transform Data
        const categories = Array.isArray(categoriesData) ? categoriesData.map((c: any) => ({
            id: c.id,
            name: c.name,
            parent: c.parent,
        })) : [];

        const tags = Array.isArray(tagsData) ? tagsData.map((t: any) => ({
            id: t.id,
            name: t.name,
        })) : [];

        // 5. Update Shop in Database
        const updatedShop = await prisma.shop.update({
            where: { id },
            data: {
                categories: categories,
                tags: tags,
            },
        });

        return NextResponse.json({ success: true, daa: updatedShop });

    } catch (error) {
        console.error("Sync Meta Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
