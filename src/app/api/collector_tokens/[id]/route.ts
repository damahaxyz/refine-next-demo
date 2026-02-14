import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";
import { accountIsolationHooks } from "@/lib/account-isolation-hooks";

const handlers = createCrudHandlers({
    model: prisma.collectorToken,
    auth: { module: "COLLECTOR_TOKEN" },
    ...accountIsolationHooks,

});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
