// PaymentsModel.ts
import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { TransactionStatusEnum } from "../../../infrastructure/TransactionStatusEnum";
import { PaymentCategoryEnum } from "../../../infrastructure/PaymentCategoryEnum";
import { PaymentSubTypeEnum } from "../../../infrastructure/PaymentSubTypeEnum";

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
    paymentCategory: {
        type: String,
        enum: [PaymentCategoryEnum.CHARGE_PERIOD,
        PaymentCategoryEnum.OTHER
        ],
        default: PaymentCategoryEnum.CHARGE_PERIOD
    },
    paymentSubType: {
        type: String,
        enum: [PaymentSubTypeEnum.LIQUIDATION, PaymentSubTypeEnum.RENEWAL],
        required: false
    },
    creditId: { type: Schema.Types.ObjectId, ref: "Credits", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers", required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transactions", required: true }
}, { timestamps: true });

export type IPayments = InferSchemaType<typeof paymentsSchema> & { _id?: Types.ObjectId };

export const PaymentsModel = model<IPayments>(CollectionNameEnum.PAYMENTS, paymentsSchema);