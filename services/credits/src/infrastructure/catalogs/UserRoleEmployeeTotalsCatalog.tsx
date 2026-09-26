import { QueryFilter, Types } from "mongoose";
import { UserRoleEnum } from "../UserRoleEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import { FiltersItems } from "../../types/SearchCreditsByEmployeeRequest";
import { CreditStatusEnum } from "../CreditStatusEnum";
import { TransactionStatusEnum } from "../TransactionStatusEnum";
import { AuthorizationContext } from "../../types/AuthorizationContext";

export const UserRoleEmployeeTotalsCatalog: Record<string, (
    filters: FiltersItems,
    authorizationContext: AuthorizationContext,
    startDate: Date,
    endDate: Date
) => QueryFilter<ICredits>> = {
    [UserRoleEnum.MANAGER]: (filters: FiltersItems, authorizationContext: AuthorizationContext, startDate: Date, endDate: Date) => {
        const userId: string = get(filters, "userId", "");
        const chargeFrequency: string[] = get(filters, "chargeFrequency", []);
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
                userId: !isEmpty(userId) ? new Types.ObjectId(userId) : undefined,
                // Se normaliza a minúsculas porque chargeRules.chargeFrequency se
                // guarda en minúsculas (ej. "weekly", "daily") en la base de datos
                "chargeRules.chargeFrequency": !isEmpty(chargeFrequency) ? { $in: chargeFrequency.map((f) => f.toLowerCase()) } : undefined
            }, (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            }) as QueryFilter<ICredits>
        };
    },
    [UserRoleEnum.CREDIT_COLLECTOR]: (filters: FiltersItems, authorizationContext: AuthorizationContext, startDate: Date, endDate: Date) => {
        const chargeFrequency: string[] = get(filters, "chargeFrequency", []);
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
            ...omitBy({
                // Se normaliza a minúsculas por la misma razón que en MANAGER
                "chargeRules.chargeFrequency": !isEmpty(chargeFrequency) ? { $in: chargeFrequency.map((f) => f.toLowerCase()) } : undefined
            }, (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            }) as QueryFilter<ICredits>
        };
    }
}

// ADMIN reutiliza el mismo filtro que MANAGER (visibilidad total de la empresa)
UserRoleEmployeeTotalsCatalog[UserRoleEnum.ADMIN] = UserRoleEmployeeTotalsCatalog[UserRoleEnum.MANAGER]!;
