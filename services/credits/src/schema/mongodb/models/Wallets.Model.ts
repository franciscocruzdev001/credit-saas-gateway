import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { WalletStatusEnum } from "../../../infrastructure/WalletStatusEnum";

// 1. Define your Mongoose Schema
const walletsSchema = new Schema({
    accountNumber: { type: String, required: true },
    status: {
        type: String, enum: [
            WalletStatusEnum.ACTIVE,
            WalletStatusEnum.INACTIVE
        ], default: WalletStatusEnum.ACTIVE,
        required: true
    },
    totalAmount: { type: Number },
    firmBalance: { type: Number, required: true }, // It only changes when the batch transactions is approved.
    pendingIncomesBalance: { type: Number, required: true }, //Real-time sum of what is in transit transactions incomes
    pendingExpensesBalance: { type: Number, required: true }, //Real-time sum of what is in transit transactions expense
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers" }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type IWallets = InferSchemaType<typeof walletsSchema> & { _id?: Types.ObjectId };

export const WalletsModel = model<IWallets>(CollectionNameEnum.WALLETS, walletsSchema);
