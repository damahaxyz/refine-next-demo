import { createCrudHandlers } from "@/lib/api-handler";
import { SystemConfig } from "@/models/systemConfig";

const handlers = createCrudHandlers({
    model: SystemConfig,
});

export const { GET, POST, DELETE, PATCH } = handlers;
