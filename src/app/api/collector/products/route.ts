
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-db";

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
        const { url, html, platform_type, product: clientParsedProduct } = body;

        if (!url) {
            return NextResponse.json({ error: "Missing required fields: url" }, { status: 400 });
        }

        let productData;

        if (clientParsedProduct) {
            console.log("Using client-side parsed data");
            productData = clientParsedProduct;
        } else {
            return NextResponse.json({ error: "Missing required fields: html or product data" }, { status: 400 });
        }

        // Additional cleanup if needed (already mostly done in parsers)
        if (Array.isArray(productData.images)) {
            productData.images = productData.images.filter((i: string) => i && i.startsWith('http'));
        }

        // Generate UUIDs for Attributes and Values
        const processedAttributes = (productData.attributes || []).map((attr: any) => ({
            id: crypto.randomUUID(),
            name: attr.name,
            values: (attr.values || []).map((val: any) => ({
                id: crypto.randomUUID(),
                value: val.value,
                image: val.image ? { id: val.image, sourceUrl: val.image } : undefined
            }))
        }));

        // Create a lookup map: AttributeName:ValueName -> ValueID
        // We also need AttributeName -> AttributeID to handle keys
        const valueIdMap: Record<string, string> = {}; // "Color:Red" -> uuid
        const attributeIdLookup: Record<string, string> = {}; // "Color" -> uuid

        processedAttributes.forEach((attr: any) => {
            attributeIdLookup[attr.name] = attr.id;
            attr.values.forEach((val: any) => {
                valueIdMap[`${attr.name}:${val.value}`] = val.id;
            });
        });

        // Process Variants to use attributeIdMap
        const processedVariants = (productData.variants || []).map((variant: any) => {
            const attributeIdMap: Record<string, string[]> = {};
            if (variant.attributes) {
                Object.entries(variant.attributes).forEach(([key, value]) => {
                    // key is Attribute Name, value is Value Name (or array of names if we supported that in collector, but usually variants have 1 value per attr)
                    // We need to find the IDs
                    const attrId = attributeIdLookup[key];

                    // Handle if value is a string (legacy/current collector) or array (future proof)
                    const values = Array.isArray(value) ? value : [value];
                    const valIds: string[] = [];

                    values.forEach((v: any) => {
                        const valId = valueIdMap[`${key}:${v as string}`];
                        if (valId) valIds.push(valId);
                    });

                    if (attrId && valIds.length > 0) {
                        attributeIdMap[attrId] = valIds;
                    }
                });
            }
            return {
                ...variant,
                sellingPrice: variant.price || productData.price || 0,
                image: variant.image ? { id: variant.image, sourceUrl: variant.image } : undefined,
                attributeIdMap
            };
        });

        // Find the first active shop for this account to associate with
        const activeShop = await prisma.shop.findFirst({
            where: {
                accountId: collectorToken.accountId,
                isActive: true
            }
        });

        // Create Product
        const product = await prisma.product.create({
            data: {

                accountId: collectorToken.accountId,
                shopId: activeShop?.id,
                title: productData.title || "Untitled Product",
                sourceUrl: url,
                sourcePlatform: platform_type,
                sourceId: productData.sourceId || null,
                price: productData.price || 0,
                sellingPrice: productData.price || 0,
                images: (productData.images || []).map((img: string) => ({ id: img, sourceUrl: img })),
                variants: processedVariants,
                attributes: processedAttributes, // Save the new structure
                videos: productData.videos || [],
                description: productData.description || "",
                descriptionImages: (productData.descriptionImages || []).map((img: string) => ({ id: img, sourceUrl: img })),
                status: "draft",
                collectedAt: new Date(),
            }
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
