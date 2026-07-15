import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { UserStatusEnum } from "../../../infrastructure/UserStatusEnum";

// 1. Define your Mongoose Schema
const usersSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    roles: [{ type: String }],
    status: { type: String, enum: [UserStatusEnum.ACTIVE, UserStatusEnum.INACTIVE], default: UserStatusEnum.ACTIVE },
    contact: {
        type: new Schema({
            name: { type: String },
            lastName: { type: String },
            adress: { type: String },
            phoneNumber: { type: String },
        }, { _id: false })
    },
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type IUsers = InferSchemaType<typeof usersSchema>;

export const UsersModel = model<IUsers>(CollectionNameEnum.USERS, usersSchema);