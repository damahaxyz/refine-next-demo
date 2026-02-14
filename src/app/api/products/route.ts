import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";

const handlers = createCrudHandlers({
    model: prisma.product,
    auth: { module: "PRODUCT" },
});

export const GET = handlers.GET;
export const POST = handlers.POST;
