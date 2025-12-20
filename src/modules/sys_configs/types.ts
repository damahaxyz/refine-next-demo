import z from "zod";

export const SysConfigSchema = z.object({
    id: z.string(),
    name: z.string(),
    key: z.string(),
    value: z.string(),
    desc: z.string(),
});
export type SysConfig = z.infer<typeof SysConfigSchema>;
