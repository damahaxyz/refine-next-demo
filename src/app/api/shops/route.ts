import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";

const handlers = createCrudHandlers({
    model: prisma.shop,
    auth: { module: "SHOP" },
});

export const GET = handlers.GET;
export const POST = handlers.POST;
