import { PipelineStage, QueryFilter } from "mongoose";
import { TransactionTypeEnum } from "../TransactionTypeEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { IPayments } from "../../schema/mongodb/models/Payments.Model";
import { TransactionStatusEnum } from "../TransactionStatusEnum";
import { UpdateQuery } from "mongoose";
import { CreditStatusEnum } from "../CreditStatusEnum";
import { CreationStatusEnum } from "../CreationStatusEnum";
import { PaymentCategoryEnum } from "../PaymentCategoryEnum";
import { defaultTo } from "lodash";

export interface UpdateQueryFiltersByEntity {
    paymentsQuery?: UpdateQuery<IPayments>;
    creditsQuery?: UpdateQuery<ICredits> | PipelineStage[];
};

export type EntityUpdateResult = Partial<Record<keyof UpdateQueryFiltersByEntity, boolean>>;



export const ENTITY_OPERATION_BUID_UPDATE: Record<string, (amountTransaction: number, transactionSubType?: CreationStatusEnum | PaymentCategoryEnum) => UpdateQueryFiltersByEntity> = {
    [TransactionTypeEnum.CREDIT]: (amountTransaction: number, transactionSubType?: CreationStatusEnum | PaymentCategoryEnum) => ({
        creditsQuery: {
            transactionStatus: TransactionStatusEnum.APPROVED
        }
    }),
    [TransactionTypeEnum.PAYMENT]: (amountTransaction: number, transactionSubType?: CreationStatusEnum | PaymentCategoryEnum) => ({
        paymentsQuery: {
            transactionStatus: TransactionStatusEnum.APPROVED
        },
        creditsQuery: [
            {
                $set: {
                    previousStatus: '$status'
                }
            },
            {
                $set: {
                    amountPaid: {
                        $cond: [
                            { $ne: [defaultTo(transactionSubType, ""), PaymentCategoryEnum.MORATORY] },
                            { $add: ['$amountPaid', amountTransaction] },
                            '$amountPaid'
                        ]
                    },
                    amountPaidMoratory: {
                        $cond: [
                            { $eq: [defaultTo(transactionSubType, ""), PaymentCategoryEnum.MORATORY] },
                            { $add: ['$amountPaidMoratory', amountTransaction] },
                            '$amountPaidMoratory'
                        ]
                    },
                    // Fecha del último pago aprobado: el momento en que se aprueba este pago
                    lastPaymentDateApproved: '$$NOW'
                }
            },
            {
                $set: {
                    status: {
                        $cond: [
                            {
                                $gte: [
                                    {
                                        $add: [
                                            { $ifNull: ['$amountPaid', 0] },
                                            { $ifNull: ['$amountPaidMoratory', 0] }
                                        ]
                                    },
                                    {
                                        $add: [
                                            { $ifNull: ['$amountDue', 0] },
                                            { $ifNull: ['$amountMoratory', 0] }
                                        ]
                                    }
                                ]
                            },
                            CreditStatusEnum.PAID,
                            '$status'
                        ]
                    }
                }
            },
            {
                $set: {
                    changeDateStatus: {
                        $cond: [
                            {
                                $ne: ['$previousStatus', '$status']
                            },
                            '$$NOW',
                            '$changeDateStatus'
                        ]
                    }
                }
            },
            {
                $unset: 'previousStatus'
            }
        ]
    })
};

export const ENTITY_CANCEL_OPERATION_BUILD_UPDATE: Record<string, (amountTransaction: number, transactionSubType?: CreationStatusEnum | PaymentCategoryEnum) => UpdateQueryFiltersByEntity> = {
    [TransactionTypeEnum.CREDIT]: (amountTransaction: number, transactionSubType?: CreationStatusEnum | PaymentCategoryEnum) => ({
        creditsQuery: {
            transactionStatus: TransactionStatusEnum.CANCELLED
        }
    }),
    [TransactionTypeEnum.PAYMENT]: (amountTransaction: number, transactionSubType?: CreationStatusEnum | PaymentCategoryEnum) => ({
        paymentsQuery: {
            transactionStatus: TransactionStatusEnum.CANCELLED
        }
    })
};