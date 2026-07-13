import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../infrastructure/CollectionNameEnum";

// 1. Define your Mongoose Schema
const creditorCompaniesSchema = new Schema({
    companyName: { type: String },
    socialReason: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    chargeRules: [{
        type: new Schema({
            chargeFrequency: { type: String },
            chargePeriods: { type: Number },
            renovationPeriod: { type: Number },
            comissionRate: { type: Number },
        }, { _id: false })
    }]
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ICreditorCompanies = InferSchemaType<typeof creditorCompaniesSchema>;

export const CreditorCompaniesModel = model<ICreditorCompanies>(CollectionNameEnum.CREDITOR_COMPANIES, creditorCompaniesSchema);