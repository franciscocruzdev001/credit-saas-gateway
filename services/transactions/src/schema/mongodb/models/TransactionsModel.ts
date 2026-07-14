import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
// 1. Define your Mongoose Schema
const transactionsSchema = new Schema({
    transactionType: { type: String },
    total: { type: Number },
    status: { type: String, enum: ["CHARGE-PROCESS", "SLOW-PAY", "PAID", "RESTRUCTURED"], default: "CHARGE-PROCESS" },
    description: { type: String },
    currency: { type: String },
    creditIdSource: { type: Schema.Types.ObjectId, ref: "Credits" },
    sourceAccount: {
        type: new Schema({
            accountNumber: { type: String },
            walletId: { type: Schema.Types.ObjectId, required: true },
        }, { _id: false })
    },
    destinationAccount: {
        type: new Schema({
            accountNumber: { type: String },
            walletId: { type: Schema.Types.ObjectId, required: true },
        }, { _id: false })
    }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ITransactions = InferSchemaType<typeof transactionsSchema>;

export const TransactionsModel = model<ITransactions>(CollectionNameEnum.TRANSACTIONS,transactionsSchema);