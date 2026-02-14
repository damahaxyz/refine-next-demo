import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";

const handlers = createCrudHandlers({
    model: prisma.systemConfig,
});

export const { GET, POST, DELETE, PATCH } = handlers;
