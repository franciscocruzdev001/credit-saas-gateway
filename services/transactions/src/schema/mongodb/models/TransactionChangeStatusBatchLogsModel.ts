import { InferSchemaType, model, Schema, Types } from "mongoose"
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { TransactionStatusEnum } from "../../../infrastructure/TransactionStatusEnum";
import { TransactionTypeEnum } from "../../../infrastructure/TransactionTypeEnum";

export const ResumeTotalsByTransactionType = new Schema({
    transactionType: {
        type: String, enum: [
            TransactionTypeEnum.CREDIT,
            TransactionTypeEnum.PAYMENT,
            TransactionTypeEnum.TRANSFER,
            TransactionTypeEnum.DEPOSIT,
            TransactionTypeEnum.WITHDRAWAL
        ], default: TransactionTypeEnum.DEPOSIT,
        required: true
    },
    totalChangeStatusApproved: { type: Number, required: true },
    totalChangeStatusRejected: { type: Number, required: true },
    transactionsChangeStatusApproved: [{
        type: new Schema({
            transactionId: { type: String, required: true },
            amountTransaction: { type: Number, required: true }
        }, { _id: false })
    }],
    transactionsChangeStatusRejected: [{
        type: new Schema({
            transactionId: { type: String, required: true },
            amountTransaction: { type: Number, required: true }
        }, { _id: false })
    }],
}, { _id: false });


// 1. Define your Mongoose Schema
const transactionChangeStatusBatchLogsSchema = new Schema({
    changeStatus: {
        type: String, enum: [
            TransactionStatusEnum.PENDING,
            TransactionStatusEnum.APPROVED,
            TransactionStatusEnum.CANCELLED
        ], default: TransactionStatusEnum.PENDING,
        required: true
    },
    resumeTotalsByTransactionType: [ResumeTotalsByTransactionType]
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ITransactionChangeStatusBatchLogs = InferSchemaType<typeof transactionChangeStatusBatchLogsSchema> & { _id?: Types.ObjectId };

export const TransactionChangeStatusBatchModel = model<ITransactionChangeStatusBatchLogs>(CollectionNameEnum.TRANSACTION_CHANGE_STATUS_BATCH_LOGS, transactionChangeStatusBatchLogsSchema);