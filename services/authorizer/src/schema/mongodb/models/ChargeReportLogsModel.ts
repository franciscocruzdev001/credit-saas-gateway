import { InferSchemaType, model, Schema } from "mongoose"
import { CollectionNameEnum } from "../../infrastructure/CollectionNameEnum";


// 1. Define your Mongoose Schema
const chargeReportLogsSchema = new Schema({
    chargeFrequency: { type: String },
    amountCharged: { type: Number },
    amountReceivable: { type: Number },
    approvedTrasactions: { type: Number },
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type IChargeReportLogs = InferSchemaType<typeof chargeReportLogsSchema>;

export const ChargeReportLogsModel = model<IChargeReportLogs>(CollectionNameEnum.CHARGEREPORTLOGS, chargeReportLogsSchema);