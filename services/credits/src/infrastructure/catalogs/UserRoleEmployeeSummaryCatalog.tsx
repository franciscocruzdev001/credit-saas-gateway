import { QueryFilter, Types } from "mongoose";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import { UserRoleEnum } from "../UserRoleEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { CreditStatusEnum } from "../CreditStatusEnum";
import { TransactionStatusEnum } from "../TransactionStatusEnum";
import { AuthorizationContext } from "../../types/AuthorizationContext";
import { FiltersItems } from "../../types/GetCreditSummaryRequest";

// Filtro base de créditos para el resumen de métricas (getCreditSummary).
// Solo créditos aprobados que estén en proceso de cobro, o que se liquidaron
// (paid) dentro del periodo — mismo criterio que UserRoleEmployeeTotalsCatalog.
// Así no se recorren todos los créditos históricos ya pagados, pero los que
// se liquidaron/renovaron en la semana siguen contando sus pagos del periodo.
export const UserRoleEmployeeSummaryCatalog: Record<string, (
    filters: FiltersItems | undefined,
    authorizationContext: AuthorizationContext,
    startDate: Date,
    endDate: Date
) => QueryFilter<ICredits>> = {
    [UserRoleEnum.MANAGER]: (filters: FiltersItems | undefined, authorizationContext: AuthorizationContext, startDate: Date, endDate: Date) => {
        const userId: string = get(filters, "userId", "");
        return {
            creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
            transactionStatus: TransactionStatusEnum.APPROVED,
            $or: [
                { status: CreditStatusEnum.CHARGE_PROCESS },
                {
                    status: CreditStatusEnum.PAID,
                    changeDateStatus: { $gte: startDate, $lt: endDate }
                }
            ],
            ...omitBy({
                // Opcional: ver el resumen de un cobrador en particular
                userId: !isEmpty(userId) ? new Types.ObjectId(userId) : undefined,
            }, (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            }) as QueryFilter<ICredits>
        };
    },
    [UserRoleEnum.CREDIT_COLLECTOR]: (_filters: FiltersItems | undefined, authorizationContext: AuthorizationContext, startDate: Date, endDate: Date) => {
        return {
            // CREDIT_COLLECTOR: creditorCompanyId y userId salen exclusivamente del
            // JWT — nunca del request, sin importar lo que venga en filters.
            creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
            userId: new Types.ObjectId(get(authorizationContext, "userId", "000000000000000000000000")),
            transactionStatus: TransactionStatusEnum.APPROVED,
            $or: [
                { status: CreditStatusEnum.CHARGE_PROCESS },
                {
                    status: CreditStatusEnum.PAID,
                    changeDateStatus: { $gte: startDate, $lt: endDate }
                }
            ],
        };
    }
}

// ADMIN reutiliza el mismo filtro que MANAGER (visibilidad total de la empresa)
UserRoleEmployeeSummaryCatalog[UserRoleEnum.ADMIN] = UserRoleEmployeeSummaryCatalog[UserRoleEnum.MANAGER]!;
