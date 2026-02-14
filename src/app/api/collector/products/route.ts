import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-db";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // Validate Token
        const collectorToken = await prisma.collectorToken.findUnique({
            where: { token },
            include: { account: true },
        });

        if (!collectorToken || !collectorToken.isActive) {
            return NextResponse.json({ error: "Invalid or inactive token" }, { status: 403 });
        }

        // Update last active
        await prisma.collectorToken.update({
            where: { id: collectorToken.id },
            data: { lastActiveAt: new Date() },
        });

        const body = await request.json();
        const { url, html, platform_type } = body;

        if (!url || !html) {
            return NextResponse.json({ error: "Missing required fields: url, html" }, { status: 400 });
        }

        // Parse HTML
        const $ = cheerio.load(html);
        const productData = {
            title: "",
            price: 0,
            images: [] as string[],
            description: "",
            sourceId: "",
            platform: platform_type
        };

        // 1. Generic Metadata Extraction (Fallback)
        const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text();
        const ogImage = $('meta[property="og:image"]').attr('content');
        const ogDesc = $('meta[property="og:description"]').attr('content');

        productData.title = ogTitle?.trim() || "Untitled Product";
        productData.description = ogDesc?.trim() || "";
        if (ogImage) productData.images.push(ogImage);

        // 2. Platform Specific Parsing
        try {
            switch (platform_type) {
                case 'TAOBAO':
                    // Try to find Taobao specific fields
                    // Title often in h1 or specific classes
                    // Price is tricky in static HTML as it's often JS rendered, but we can try meta or hidden inputs
                    const tbTitle = $('h1').text().trim();
                    if (tbTitle) productData.title = tbTitle;

                    // Try finding price in scripts or specific elements if visible in static HTML
                    // Note: Taobao prices are often difficult to get from raw HTML without executing JS.
                    // We rely on what the extension captured (which is the rendered DOM).
                    const tbPrice = $('.price').first().text() || $('.tb-main-price').text();
                    if (tbPrice) {
                        const match = tbPrice.match(/[\d.]+/);
                        if (match) productData.price = parseFloat(match[0]);
                    }

                    // Images
                    $('#J_UlThumb img').each((_, el) => {
                        let src = $(el).attr('src') || $(el).attr('data-src');
                        if (src) {
                            if (src.startsWith('//')) src = 'https:' + src;
                            productData.images.push(src.replace(/_\d+x\d+.*$/, '')); // Get full size
                        }
                    });
                    break;

                case '1688':
                    const alTitle = $('.title-text').text().trim() || $('.d-title').text().trim();
                    if (alTitle) productData.title = alTitle;

                    const alPrice = $('.ref-price').text() || $('.price-text').text();
                    if (alPrice) {
                        const match = alPrice.match(/[\d.]+/);
                        if (match) productData.price = parseFloat(match[0]);
                    }

                    // 1688 Gallery
                    $('.detail-gallery-img').each((_, el) => {
                        let src = $(el).attr('src');
                        if (src) productData.images.push(src);
                    });
                    break;

                case 'AMAZON':
                    productData.title = $('#productTitle').text().trim() || productData.title;
                    const amzPrice = $('.a-price .a-offscreen').first().text();
                    if (amzPrice) {
                        const match = amzPrice.match(/[\d.]+/);
                        if (match) productData.price = parseFloat(match[0]);
                    }
                    $('#landingImage, #imgBlkFront').each((_, el) => {
                        const src = $(el).attr('src');
                        if (src) productData.images.push(src);
                    });
                    break;

                case 'SHOPIFY':
                    // Shopify often has handy JSON-LD or meta globals
                    // Doing basic meta fallback mostly works for Shopify
                    const shopifyPrice = $('meta[property="og:price:amount"]').attr('content');
                    if (shopifyPrice) productData.price = parseFloat(shopifyPrice);
                    break;
            }
        } catch (e) {
            console.warn("Parsing error:", e);
        }

        // Uniqueness cleanup
        productData.images = Array.from(new Set(productData.images)).filter(i => i.startsWith('http'));

        // Create Product
        const product = await prisma.product.create({
            data: {
                accountId: collectorToken.accountId,
                title: productData.title,
                sourceUrl: url,
                sourcePlatform: platform_type,
                sourceId: productData.sourceId, // Might be empty if not parsed
                price: productData.price || 0,
                images: JSON.stringify(productData.images),
                description: productData.description,
                status: "draft",
                collectedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, data: product });

    } catch (error) {
        console.error("Collector API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
