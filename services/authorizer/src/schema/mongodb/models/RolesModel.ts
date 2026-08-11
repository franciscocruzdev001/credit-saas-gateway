import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";

const rolesSchema = new Schema({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String }],
}, { timestamps: true });

export type IRoles = InferSchemaType<typeof rolesSchema> & { _id?: Types.ObjectId };

export const RolesModel = model<IRoles>(CollectionNameEnum.ROLES, rolesSchema);