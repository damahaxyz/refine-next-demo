import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";

const handlers = createCrudHandlers({
    model: prisma.role,
    auth: { module: "ROLE" },
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
