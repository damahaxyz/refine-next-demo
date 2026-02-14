import z from "zod";

export const CollectorTokenSchema = z.object({
    id: z.string(),
    accountId: z.string(),
    token: z.string(),
    name: z.string(),
    lastActiveAt: z.date().optional().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
});

export type CollectorToken = z.infer<typeof CollectorTokenSchema>;
