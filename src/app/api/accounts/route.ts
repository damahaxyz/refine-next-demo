
import { createCrudHandlers } from "@/lib/api-handler";
import Account from "@/models/account";
import { hash } from "bcryptjs";

const handlers = createCrudHandlers({
    model: Account,
    auth: { module: "ACCOUNT" },
    onBeforeCreate: async (data: any) => {
        if (data.password) {
            data.password = await hash(data.password, 10);
        }
        return data;
    },
    onBeforeUpdate: async (id, data: any) => {
        if (data.password) {
            data.password = await hash(data.password, 10);
        } else {
            delete data.password; // Don't accidentally overwrite with null/empty
        }
        return data;
    }
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
