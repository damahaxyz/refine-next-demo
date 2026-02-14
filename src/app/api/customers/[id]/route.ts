
import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";

const handlers = createCrudHandlers({
    model: prisma.customer,
    auth: {
        module: "CUSTOMER", // Requires CUSTOMER-VIEW, CUSTOMER-EDIT, CUSTOMER-DELETE
    },
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
