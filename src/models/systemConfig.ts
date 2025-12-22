import mongoose, { Schema } from "mongoose";
import { baseSchemaOptions } from "./base";

const schema = new Schema({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    desc: { type: String, required: false },
}, baseSchemaOptions);

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model("SystemConfig", schema);
