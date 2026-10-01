import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";

// Información de contacto — la comparten el cliente (contact) y su aval
const contactSchema = new Schema({
    name: { type: String },
    lastName: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    ubication: {
        type: new Schema({
            latitude: { type: String },
            longitude: { type: String },
        }, { _id: false }),
        required: false
    },
}, { _id: false });

// Aval del cliente — si el aval ya es un customer registrado se guarda su
// customerId (opcional); contact siempre lleva sus datos de contacto
const avalSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: "Customers", required: false },
    contact: { type: contactSchema },
}, { _id: false });

// 1. Define your Mongoose Schema
const customersSchema = new Schema({
    status: { type: String },
    threeWordsUbication: { type: String },
    contact: { type: contactSchema },
    // Aval del cliente — opcional, los clientes existentes no lo tienen
    aval: { type: avalSchema, required: false },
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type ICustomers = InferSchemaType<typeof customersSchema> & { _id?: Schema.Types.ObjectId };

export const CustomersModel = model<ICustomers>(CollectionNameEnum.CUSTOMERS, customersSchema);