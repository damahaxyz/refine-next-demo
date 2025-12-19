
import { createCrudHandlers } from "@/lib/api-handler";
import Role from "@/models/role";

const handlers = createCrudHandlers({
    model: Role,
    auth: { module: "ROLE" },
});

export const GET = handlers.GET;
export const POST = handlers.POST;
