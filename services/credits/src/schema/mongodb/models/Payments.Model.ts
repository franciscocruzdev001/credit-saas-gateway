import { InferSchemaType, model, Schema } from "mongoose";
import { CollectionNameEnum } from "../../../infrastructure/CollectionNameEnum";

// 1. Define your Mongoose Schema
const paymentsSchema = new Schema({
    total: { type: Number },
    paymentMethod: { type: String },
    creditId: { type: Schema.Types.ObjectId, ref: "Credits", required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transactions", required: true }
});

// 2. Automatically generate/infer the TypeScript interface/type
export type IPayments = InferSchemaType<typeof paymentsSchema>;

export const PaymentsModel = model<IPayments>(CollectionNameEnum.PAYMENTS, paymentsSchema);