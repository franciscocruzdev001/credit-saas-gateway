import { InferSchemaType, model, Schema } from "mongoose";

// 1. Define your Mongoose Schema
const latePaymentFeeLogsSchema = new Schema({
    created: { type: String },
    chargeReportLogsDate: { type: Schema.Types.Date },
    creditId: { type: Schema.Types.ObjectId, ref: "Credits", required: true }
});

// 2. Automatically generate/infer the TypeScript interface/type
export type ILatePaymentFeeLogs = InferSchemaType<typeof latePaymentFeeLogsSchema>;

export const LatePaymentFeeLogsModel = model<ILatePaymentFeeLogs>('LatePaymentFeeLogs', latePaymentFeeLogsSchema);