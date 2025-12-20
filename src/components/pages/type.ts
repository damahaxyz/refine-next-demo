import z from "zod";

export const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  status: z.string(),
  createdAt: z.string(),
  category: z.object({
    id: z.string(),
  }),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  title: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

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

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  permissions: z.array(z.string())
});
export type Role = z.infer<typeof RoleSchema>;

export const SysConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  value: z.string(),
  desc: z.string(),
});
export type SysConfig = z.infer<typeof SysConfigSchema>;
