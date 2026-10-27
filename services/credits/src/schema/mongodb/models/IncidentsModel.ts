import { InferSchemaType, model, Schema, Types } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";

// 1. Define your Mongoose Schema
// Incidente (falta) de un crédito con el cargo moratorio que le corresponde.
const incidentsSchema = new Schema({
    creditorCompanyId: { type: Schema.Types.ObjectId, ref: "CreditorCompanies", required: true },
    creditId: { type: Schema.Types.ObjectId, ref: "Credits", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers", required: true },
    // Cargo fijo por incidente, copiado de chargeRules.latePaymentCharge del crédito
    latePaymentCharge: { type: Number, required: false },
    description: { type: String },
    currency: { type: String }
}, { timestamps: true });

// 2. Automatically generate/infer the TypeScript interface/type
export type IIncidents = InferSchemaType<typeof incidentsSchema> & { _id?: Types.ObjectId };

export const IncidentsModel = model<IIncidents>(CollectionNameEnum.INCIDENTS, incidentsSchema);
