import z from "zod";

export const TranslationConfigSchema = z.object({
    id: z.string(),
    accountId: z.string(),
    provider: z.string(),
    appId: z.string().optional().nullable(),
    apiKey: z.string(),
    defaultTargetLang: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type TranslationConfig = z.infer<typeof TranslationConfigSchema>;
