
import mongoose, { Schema } from "mongoose";
import { baseSchemaOptions } from "./base";

const AccountSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String },
        password: { type: String, required: true, select: false },
        name: { type: String },
        avatar: { type: String },
        roleIds: { type: [String], default: [] },
        extraPermissions: { type: [String], default: [] },
    },
    baseSchemaOptions
);

// Modify toJSON specifically for Account to hide password
// We extend the base transform
const baseTransform = baseSchemaOptions.toJSON?.transform as Function;
AccountSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc: any, ret: any, options: any) {
        if (baseTransform) {
            baseTransform(doc, ret, options);
        }
        delete ret.password;
        return ret;
    }
});

const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);
export default Account;
