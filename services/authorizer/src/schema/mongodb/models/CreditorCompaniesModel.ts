import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";
import { OldDayEnum } from "../../../infrastructure/OldDayEnum";

// 1. Define your Mongoose Schema
const creditorCompaniesSchema = new Schema({
    companyName: { type: String },
    socialReason: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    chargeRules: [{ 
        type: new Schema({
            chargeFrequency: { type: String },
           chargePeriods: { type: Number, required: true },
            chargeDay: {type: String, enum:[
                OldDayEnum.MONDAY,
                OldDayEnum.TUESDAY,
                OldDayEnum.WEDNESDAY,
                OldDayEnum.THURSDAY,
                OldDayEnum.FRIDAY,
                OldDayEnum.SATURDAY,
                OldDayEnum.SUNDAY
            ]},
            renovationPeriod: { type: Number },
            comissionRate: { type: Number },
        }, { _id: false })
    }]
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ICreditorCompanies = InferSchemaType<typeof creditorCompaniesSchema> & { _id?: Types.ObjectId };

export const CreditorCompaniesModel = model<ICreditorCompanies>(CollectionNameEnum.CREDITOR_COMPANIES, creditorCompaniesSchema);

