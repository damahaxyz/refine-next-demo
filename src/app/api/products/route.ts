import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";
import { accountIsolationHooks } from "@/lib/account-isolation-hooks";

const handlers = createCrudHandlers({
    model: prisma.product,
    auth: { module: "PRODUCT" },
    ...accountIsolationHooks,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
