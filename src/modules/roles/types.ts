import z from "zod";

export const RoleSchema = z.object({
    id: z.string(),
    name: z.string(),
    permissions: z.array(z.string())
});
export type Role = z.infer<typeof RoleSchema>;
