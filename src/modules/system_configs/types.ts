import z from "zod";

export const SystemConfigSchema = z.object({
    id: z.string(),
    name: z.string(),
    key: z.string(),
    value: z.string(),
    desc: z.string(),
});
export type SystemConfig = z.infer<typeof SystemConfigSchema>;
