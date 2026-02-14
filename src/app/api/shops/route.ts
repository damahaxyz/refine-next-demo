import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";
import { accountIsolationHooks } from "@/lib/account-isolation-hooks";

const handlers = createCrudHandlers({
    model: prisma.shop,
    auth: { module: "SHOP" },
    ...accountIsolationHooks,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
