
import { createCrudHandlers } from "@/lib/api-handler";
import Customer from "@/models/customer";

const handlers = createCrudHandlers({
    model: Customer,
    auth: {
        module: "CUSTOMER", // Requires CUSTOMER-VIEW, CUSTOMER-EDIT, CUSTOMER-DELETE
    },
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
