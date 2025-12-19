
import { createCrudHandlers } from "@/lib/api-handler";
import Account from "@/models/account";
import { hash } from "bcryptjs";

const handlers = createCrudHandlers({
    model: Account,
    auth: { module: "ACCOUNT" },
    onBeforeUpdate: async (id, data: any) => {
        if (data.password) {
            data.password = await hash(data.password, 10);
        }
        return data;
    }
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
