
import { createCrudHandlers, QueryOptions } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma-db";

import { hash } from "bcryptjs";

const handlers = createCrudHandlers({
    model: prisma.account,
    auth: { module: "ACCOUNT" },
    onBeforeUpdate: async (where, data) => {
        if (data?.password) {
            data.password = await hash(data.password, 10);
        } else {
            delete data.password;
        }
        return { where, data };
    }
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
