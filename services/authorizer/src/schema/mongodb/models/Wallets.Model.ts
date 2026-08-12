import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";

const walletsSchema = new Schema({
    accountNumber: { type: String },
    status: { type: String, enum: ["CHARGE-PROCESS", "SLOW-PAY", "PAID", "RESTRUCTURED"], default: "CHARGE-PROCESS" },
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    totalAmount: { type: Number },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers" }
}, { timestamps: true });

export type IWallets = InferSchemaType<typeof walletsSchema> & { _id?: Types.ObjectId };

export const WalletsModel = model<IWallets>(CollectionNameEnum.WALLETS, walletsSchema);