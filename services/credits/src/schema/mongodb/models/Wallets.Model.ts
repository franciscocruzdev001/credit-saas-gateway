import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";

// 1. Define your Mongoose Schema
const walletsSchema = new Schema({
    accountNumber: { type: String },
    status: { type: String, enum: ["CHARGE-PROCESS", "SLOW-PAY", "PAID", "RESTRUCTURED"], default: "CHARGE-PROCESS" },
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    totalAmount: { type: Number },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers" }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type IWallets = InferSchemaType<typeof walletsSchema>;

export const WalletsModel = model<IWallets>(CollectionNameEnum.WALLETS, walletsSchema);