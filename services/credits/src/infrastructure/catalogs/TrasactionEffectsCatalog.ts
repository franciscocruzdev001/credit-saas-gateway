import { update } from "lodash";
import { TransactionTypeEnum } from "../TransactionTypeEnum"
import { TransactionOperationEnum } from "../TransactionOperationEnum";
import { IWallets } from "../../schema/mongodb/models/Wallets.Model";
import { QueryFilter } from "mongoose";
import { UpdateQuery } from "mongoose";

export interface UpdateOperation {
    update: boolean,
    operation: TransactionOperationEnum
}

export const TRANSACTION_EFFECTS: Record<TransactionTypeEnum, {
    sourceAccount: UpdateOperation,
    destinationAccount: UpdateOperation
}> = {
    [TransactionTypeEnum.CREDIT]: {
        sourceAccount: { update: true, operation: TransactionOperationEnum.EXPENSES },
        destinationAccount: { update: true, operation: TransactionOperationEnum.INCOMES },
    },
    [TransactionTypeEnum.WITHDRAWAL]: {
        sourceAccount: { update: true, operation: TransactionOperationEnum.EXPENSES },
        destinationAccount: { update: false, operation: TransactionOperationEnum.NA },
    },
    [TransactionTypeEnum.TRANSFER]: {
        sourceAccount: { update: true, operation: TransactionOperationEnum.EXPENSES },
        destinationAccount: { update: true, operation: TransactionOperationEnum.INCOMES },
    },
    [TransactionTypeEnum.DEPOSIT]: {
        sourceAccount: { update: false, operation: TransactionOperationEnum.NA },
        destinationAccount: { update: true, operation: TransactionOperationEnum.INCOMES },
    },
    [TransactionTypeEnum.PAYMENT]: {
        sourceAccount: { update: false, operation: TransactionOperationEnum.NA },
        destinationAccount: { update: true, operation: TransactionOperationEnum.INCOMES },
    }
};

export const TRANSACTION_PENDING_OPERATION_WALLET_BUILD: Record<TransactionOperationEnum, (walletId: string, accountNumber: string, amountTransaction: number) => {
    queryfilter: QueryFilter<IWallets>,
    updateQuery: UpdateQuery<IWallets>
}> = {
    [TransactionOperationEnum.EXPENSES]: (walletId: string, accountNumber: string, amountTransaction: number) => ({
        queryfilter: {
            _id: walletId,
            accountNumber: accountNumber,
            // Condición estricta: Egresos pendiente - Ingresos pendientes + Nuevo Monto <= Limite (balance firme)
            $expr: {
                $lte: [
                    { $add: ["$pendingExpensesBalance", "-$pendingIncomesBalance", amountTransaction] },
                    "$firmBalance"
                ]
            }
        },
        updateQuery: {
            // Si cumple la condición, incrementa el acumulador de egresos pendientes de forma atómica
            $inc: { pendingExpensesBalance: amountTransaction }
        }
    }),
    [TransactionOperationEnum.INCOMES]: (walletId: string, accountNumber: string, amountTransaction: number) => ({
        queryfilter: {
            _id: walletId,
            accountNumber: accountNumber
        },
        updateQuery: {
            // Si cumple la condición, incrementa el acumulador de ingresos pendientes de forma atómica
            $inc: { pendingIncomesBalance: amountTransaction }
        }
    }),
    [TransactionOperationEnum.NA]: (walletId: string, accountNumber: string, amountTransaction: number) => ({
        queryfilter: {},
        updateQuery: {}
    }),

};