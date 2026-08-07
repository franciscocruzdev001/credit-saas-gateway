import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { CreditStatusEnum } from "../../../infrastructure/CreditStatusEnum";
import { TransactionStatusEnum } from "../../../infrastructure/TransactionStatusEnum";

// 1. Define your Mongoose Schema
const creditsSchema = new Schema({
    startDateChargeConfig: { type: Schema.Types.Date, required: true },
    admissionDate: { type: Schema.Types.Date, required: true },
    expirationDate: { type: Schema.Types.Date, required: true },
    creditAmount: { type: Number, required: true },
    creditAmountWithMoratory: { type: Number, required: true },
    fixedCharge: { type: Number, required: true },
    status: {
        type: String, enum: [
            CreditStatusEnum.CHARGE_PROCESS,
            CreditStatusEnum.SLOW_PAY,
            CreditStatusEnum.PAID,
            CreditStatusEnum.RESTRUCTURED
        ], default: CreditStatusEnum.CHARGE_PROCESS
    },
    transactionStatus: {
        type: String, enum: [
            TransactionStatusEnum.PENDING,
            TransactionStatusEnum.APPROVED,
            TransactionStatusEnum.CANCELLED
        ], default: TransactionStatusEnum.PENDING
    },
    chargeRules: {
        type: new Schema({
            chargeFrequency: { type: String, required: true },
            chargePeriods: { type: Number, required: true },
            renovationPeriod: { type: Number, required: true },
            comissionRate: { type: Number, required: true },
        }, { _id: false }), required: true
    },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transactions", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers", required: true }
});

// 2. Automatically generate/infer the TypeScript interface/type
export type ICredits = InferSchemaType<typeof creditsSchema>;


export const CreditsModel = model<ICredits>(CollectionNameEnum.CREDITS, creditsSchema);