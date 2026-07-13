import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../infrastructure/CollectionNameEnum";

// 1. Define your Mongoose Schema
const customersSchema = new Schema({
    status: { type: String },
    threeWordsUbication: { type: String },
    contact: {
        type: new Schema({
            name: { type: String },
            lastName: { type: String },
            adress: { type: String },
            phoneNumber: { type: String },
        }, { _id: false })
    },
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ICustomers = InferSchemaType<typeof customersSchema>;

export const CustomersModel = model<ICustomers>(CollectionNameEnum.CUSTOMERS, customersSchema);