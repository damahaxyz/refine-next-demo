import { createCrudHandlers } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";

const handlers = createCrudHandlers({
    model: prisma.customer,
    auth: {
        module: "CUSTOMER", // Requires CUSTOMER-VIEW, CUSTOMER-NEW permissions
    },
    onBeforeCreate: async (data: any) => {
        // Simple password hashing if needed, or keeping it plain text as per previous model
        return data;
    }
});

export const GET = handlers.GET;
export const POST = handlers.POST;
