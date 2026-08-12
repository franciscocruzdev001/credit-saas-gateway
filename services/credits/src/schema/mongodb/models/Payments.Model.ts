// PaymentsModel.ts
import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { TransactionStatusEnum } from "../../../infrastructure/TransactionStatusEnum";

const paymentsSchema = new Schema({
    total: { type: Number },
    paymentMethod: { type: String },
    transactionStatus: {
        type: String, enum: [
            TransactionStatusEnum.PENDING,
            TransactionStatusEnum.APPROVED,
            TransactionStatusEnum.CANCELLED
        ], default: TransactionStatusEnum.PENDING
    },
    creditId: { type: Schema.Types.ObjectId, ref: "Credits", required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transactions", required: true }
}, { timestamps: true });

export type IPayments = InferSchemaType<typeof paymentsSchema> & { _id?: Types.ObjectId };

export const PaymentsModel = model<IPayments>(CollectionNameEnum.PAYMENTS, paymentsSchema);