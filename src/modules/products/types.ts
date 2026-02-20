import z from "zod";

export const ImageObjectSchema = z.object({
    sourceUrl: z.string(),
    processedUrl: z.string().optional().nullable(),
});

export const VariantSchema = z.object({
    id: z.string(),
    price: z.number(),
    sellingPrice: z.number().optional(),
    stock: z.number().optional(),
    image: ImageObjectSchema.optional(),
    attributeIdMap: z.record(z.string(), z.array(z.string())), // {"attrId1": ["valueId1", "valueId2"], "attrId2": ["valueId3", "valueId4"]}
});
export const attributeSchema = z.object({
    id: z.string(),
    name: z.string(),
    nameProcessed: z.string().optional(),
    values: z.array(z.object({
        id: z.string(),
        value: z.string(),
        valueProcessed: z.string().optional(),
        image: ImageObjectSchema.optional(),
    })),
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
    price: z.number(),
    priceCurrency: z.string(),
    sellingPrice: z.number().optional().nullable(),
    sellingCurrency: z.string().optional().nullable(),
    hasVariants: z.boolean(),
    variants: z.array(VariantSchema).optional().nullable(),
    attributes: z.array(attributeSchema).optional().nullable(), // JSON
    images: z.array(ImageObjectSchema),
    descriptionImages: z.array(ImageObjectSchema).optional().nullable(),
    categories: z.any().optional().nullable(), // JSON
    tags: z.any().optional().nullable(), // JSON
    keywords: z.string().optional().nullable(),
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
export type ImageObject = z.infer<typeof ImageObjectSchema>;

