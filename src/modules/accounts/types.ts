import z from "zod";

export const AccountSchema = z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    password: z.string(),
    avatar: z.string(),
    roleIds: z.array(z.string()),
    extraPermissions: z.array(z.string()),
    created: z.date(),
    modify: z.date()
})
export type Account = z.infer<typeof AccountSchema>;
