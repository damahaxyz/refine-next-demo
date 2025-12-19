
import { SchemaOptions } from "mongoose";

/**
 * Emulates the BaseEntity from Spring Boot.
 * - Maps createdAt -> createAt
 * - Maps updatedAt -> updateAt
 * - Provides standard toJSON transformation (id normalization, remove _id/__v)
 */
export const baseSchemaOptions: SchemaOptions = {
    timestamps: { createdAt: "createAt", updatedAt: "updateAt" },
    toJSON: {
        virtuals: true,
        transform: function (doc: any, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
    }
};
