import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { CreditStatusEnum } from "../../../infrastructure/CreditStatusEnum";
import { TransactionStatusEnum } from "../../../infrastructure/TransactionStatusEnum";
import { chargeFrequencyEnum } from "../../../infrastructure/ChargeFrequencyEnum";
import { OldDayEnum } from "../../../infrastructure/OldDayEnum";
import { CreationStatusEnum } from "../../../infrastructure/CreationStatusEnum";

// 1. Define your Mongoose Schema
const creditsSchema = new Schema({
    startDateChargeConfig: { type: Schema.Types.Date, required: true },
    admissionDate: { type: Schema.Types.Date, required: true },
    expirationDate: { type: Schema.Types.Date, required: true },
    creditAmount: { type: Number, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
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
    creationStatus: {
        type: String, enum: [
            CreationStatusEnum.NEW,
            CreationStatusEnum.RENEWED
        ], default: CreationStatusEnum.NEW,
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
            chargeFrequency: {
                type: String, enum: [
                    chargeFrequencyEnum.DAILY,
                    chargeFrequencyEnum.WEEKLY
                ]
            },

            chargePeriods: { type: Number, required: true },
            chargeDay: {
                type: String, enum: [
                    OldDayEnum.MONDAY,
                    OldDayEnum.TUESDAY,
                    OldDayEnum.WEDNESDAY,
                    OldDayEnum.THURSDAY,
                    OldDayEnum.FRIDAY,
                    OldDayEnum.SATURDAY,
                    OldDayEnum.SUNDAY
                ]
            },
            renovationPeriod: { type: Number, required: true },
            comissionRate: { type: Number, required: true },
        }, { _id: false }), required: true
    },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transactions", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers", required: true }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ICredits = InferSchemaType<typeof creditsSchema> & { _id?: Types.ObjectId };

export const CreditsModel = model<ICredits>(CollectionNameEnum.CREDITS, creditsSchema);