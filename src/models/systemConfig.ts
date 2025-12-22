import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "./base";

const schema = new Schema({
    ...BaseSchema,
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    desc: { type: String, required: false },
}, { timestamps: true });

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model("SystemConfig", schema);
