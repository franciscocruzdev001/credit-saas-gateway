import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { TransactionStatusEnum } from "../../../infrastructure/TransactionStatusEnum";
import { TransactionTypeEnum } from "../../../infrastructure/TransactionTypeEnum";
// 1. Define your Mongoose Schema
const transactionsSchema = new Schema({
    transactionType: {
        type: String, enum: [
            TransactionTypeEnum.CREDIT,
            TransactionTypeEnum.PAYMENT,
            TransactionTypeEnum.TRANSFER
        ], default: TransactionTypeEnum.DEPOSIT
    },
    status: {
        type: String, enum: [
            TransactionStatusEnum.PENDING,
            TransactionStatusEnum.APPROVED,
            TransactionStatusEnum.CANCELLED
        ], default: TransactionStatusEnum.PENDING
    },
    total: { type: Number },
    description: { type: String },
    currency: { type: String },
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
    },
    creditIdSource: { type: Schema.Types.ObjectId, ref: "Credits" },
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true },
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ITransactions = InferSchemaType<typeof transactionsSchema>;

export const TransactionsModel = model<ITransactions>(CollectionNameEnum.TRANSACTIONS, transactionsSchema);