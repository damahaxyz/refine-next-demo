
import mongoose, { Schema } from "mongoose";
import { baseSchemaOptions } from "./base";

const CustomerSchema = new Schema(
    {
        name: { type: String, required: true },
        password: { type: String, select: false },
        remark: { type: String },
    },
    baseSchemaOptions
);

const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

export default Customer;
