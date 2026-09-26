import { PipelineStage, QueryFilter } from "mongoose";
import { TransactionTypeEnum } from "../TransactionTypeEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { IPayments } from "../../schema/mongodb/models/Payments.Model";
import { TransactionStatusEnum } from "../TransactionStatusEnum";
import { UpdateQuery } from "mongoose";
import { CreditStatusEnum } from "../CreditStatusEnum";

export interface UpdateQueryFiltersByEntity {
    paymentsQuery?: UpdateQuery<IPayments>;
    creditsQuery?: UpdateQuery<ICredits> | PipelineStage[];
};

export type EntityUpdateResult = Partial<Record<keyof UpdateQueryFiltersByEntity, boolean>>;



export const ENTITY_OPERATION_BUID_UPDATE: Record<string, (amountTransaction: number) => UpdateQueryFiltersByEntity> = {
    [TransactionTypeEnum.CREDIT]: (_: number) => ({
        creditsQuery: {
            transactionStatus: TransactionStatusEnum.APPROVED
        }
    }),
    [TransactionTypeEnum.PAYMENT]: (amountTransaction: number) => ({
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
                        $add: ['$amountPaid', amountTransaction]
                    }
                }
            },
            {
                $set: {
                    status: {
                        $cond: [
                            { $gte: ['$amountPaid', '$amountDue'] },
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

export const ENTITY_CANCEL_OPERATION_BUILD_UPDATE: Record<string, (amountTransaction: number) => UpdateQueryFiltersByEntity> = {
    [TransactionTypeEnum.CREDIT]: (_: number) => ({
        creditsQuery: {
            transactionStatus: TransactionStatusEnum.CANCELLED
        }
    }),
    [TransactionTypeEnum.PAYMENT]: (_: number) => ({
        paymentsQuery: {
            transactionStatus: TransactionStatusEnum.CANCELLED
        }
    })
};