import z from "zod";

export const ShopSchema = z.object({
    id: z.string(),
    accountId: z.string(),
    type: z.string(),
    name: z.string(),
    url: z.string(),
    apiKey: z.string(),
    apiSecret: z.string(),
    version: z.string().optional().nullable(),
    defaultLanguage: z.string(),
    defaultCurrency: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Shop = z.infer<typeof ShopSchema>;
