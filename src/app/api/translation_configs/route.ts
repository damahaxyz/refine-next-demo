import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";
import { accountIsolationHooks } from "@/lib/account-isolation-hooks";

const handlers = createCrudHandlers({
    model: prisma.translationConfig,
    auth: { module: "TRANSLATION_CONFIG" },
    ...accountIsolationHooks,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
