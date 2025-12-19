
import mongoose, { Schema } from "mongoose";
import { baseSchemaOptions } from "./base";

const RoleSchema = new Schema(
    {
        name: { type: String, required: true },
        permissions: { type: [String], default: [] },
    },
    baseSchemaOptions
);

const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);
export default Role;
