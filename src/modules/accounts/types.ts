import z from "zod";

export const AccountSchema = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string().nullable().optional(),
    password: z.string(), // Usually excluded in responses, but kept here if used for forms
    name: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    roleIds: z.array(z.string()),
    extraPermissions: z.array(z.string()),
    apiToken: z.string().nullable().optional(),
    status: z.string().default("active"),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),

})
export type Account = z.infer<typeof AccountSchema>;
