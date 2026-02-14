import z from "zod";

export const VariantSchema = z.object({
    id: z.string(),
    price: z.number(),
    sellingPrice: z.number().optional(),
    stock: z.number().optional(),
    image: z.string().optional(),
    attributes: z.array(z.object({
        name: z.string(),
        value: z.string()
    }))
});

export const ProductSchema = z.object({
    id: z.string(),
    accountId: z.string(),
    sourceUrl: z.string(),
    sourcePlatform: z.string(),
    sourceId: z.string().optional().nullable(),
    title: z.string(),
    titleTranslated: z.string().optional().nullable(),
    description: z.string(),
    descriptionTranslated: z.string().optional().nullable(),
    price: z.number(),
    priceCurrency: z.string(),
    sellingPrice: z.number().optional().nullable(),
    sellingCurrency: z.string().optional().nullable(),
    hasVariants: z.boolean(),
    variants: z.array(VariantSchema).optional().nullable(),
    specs: z.any().optional().nullable(), // JSON
    images: z.array(z.string()),
    imagesProcessed: z.array(z.string()).optional().nullable(),
    categories: z.any().optional().nullable(), // JSON
    status: z.enum(["draft", "translated", "ready", "published", "archived"]),
    shopId: z.string().optional().nullable(),
    externalId: z.string().optional().nullable(),
    targetLanguage: z.string().optional().nullable(),
    translatedAt: z.date().optional().nullable(),
    publishedAt: z.date().optional().nullable(),
    collectedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof VariantSchema>;
