import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";
import { accountIsolationHooks } from "@/lib/account-isolation-hooks";
import { Product } from "@prisma/client";
import { ImageObject, Product as ProductType } from "@/modules/products/types";
import path from "path";
import fs from "fs/promises";

// Helper to extract all image URLs used in a product
function extractProductImageUrls(product: any): string[] {
    const urls: string[] = [];
    const _p = product as ProductType;

    const addUrl = (img?: ImageObject | null) => {
        if (!img) return;
        if (img.sourceUrl) urls.push(img.sourceUrl);
        if (img.processedUrl) urls.push(img.processedUrl);
    };

    if (Array.isArray(_p.images)) {
        _p.images.forEach(addUrl);
    }
    if (Array.isArray(_p.descriptionImages)) {
        _p.descriptionImages.forEach(addUrl);
    }
    if (Array.isArray(_p.variants)) {
        _p.variants.forEach(v => addUrl(v.image));
    }
    if (Array.isArray(_p.attributes)) {
        _p.attributes.forEach(attr => {
            if (Array.isArray(attr.values)) {
                attr.values.forEach(val => addUrl(val.image));
            }
        });
    }

    // Only keep local absolute paths (starting with /products/)
    const uniqueUrls = Array.from(new Set(urls));
    return uniqueUrls.filter(url => url && url.startsWith("/products/"));
}

const handlers = createCrudHandlers({
    model: prisma.product,
    auth: { module: "PRODUCT" },
    ...accountIsolationHooks,
    onAfterUpdate: async (product: Product) => {
        try {
            // Extract all image paths currently referenced by the product
            const usedImageUrls = extractProductImageUrls(product);
            const usedFilenames = new Set(usedImageUrls.map(url => path.basename(url)));

            const productDir = path.join(process.cwd(), "public", "products", product.id);

            // Check if directory exists
            try {
                await fs.access(productDir);
            } catch {
                return product; // Directory doesn't exist, nothing to clean
            }

            // Read all files in the product's directory
            const files = await fs.readdir(productDir);

            // Delete files that are not referenced in the product data
            for (const file of files) {
                if (!usedFilenames.has(file)) {
                    const filePath = path.join(productDir, file);
                    try {
                        await fs.unlink(filePath);
                        console.log(`[Image Cleanup] Deleted unused image: ${filePath}`);
                    } catch (err) {
                        console.error(`[Image Cleanup] Failed to delete image ${filePath}:`, err);
                    }
                }
            }
        } catch (error) {
            console.error("[Image Cleanup] Error during cleanup:", error);
        }

        return product;
    }
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
