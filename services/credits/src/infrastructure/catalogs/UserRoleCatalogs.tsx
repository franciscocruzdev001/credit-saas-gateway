import { QueryFilter, Types } from "mongoose";
import { UserRoleEnum } from "../UserRoleEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import { FiltersItems } from "../../types/SearchCreditsByEmployeeRequest";
import { ICustomers } from "../../schema/mongodb/models/Customers.Model";
import { CreditStatusEnum } from "../CreditStatusEnum";
import { TransactionStatusEnum } from "../TransactionStatusEnum";
import { AuthorizationContext } from "../../types/AuthorizationContext";

export const UserRoleEmployeeCatalog: Record<string, (filters: FiltersItems ,  authorizationContext: AuthorizationContext) => {
    creditsFilters: QueryFilter<ICredits>,
    customerFilters: QueryFilter<ICustomers>
}> = {
    [UserRoleEnum.MANAGER]: (filters: FiltersItems, authorizationContext: AuthorizationContext) => {
        const generalSearch: string = get(filters, "generalSearch", "");
        const userId: string = get(filters, "userId", "");
        const chargeFrequency: string[] = get(filters, "chargeFrequency", []);
        return {
            creditsFilters: {
                creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
                status: CreditStatusEnum.CHARGE_PROCESS,
                transactionStatus: TransactionStatusEnum.APPROVED,
                ...omitBy({
                    //status: get(searchCreditsData, "status", undefined),
                    userId: !isEmpty(userId) ? new Types.ObjectId(userId) : undefined,
                    // Se normaliza a minúsculas porque chargeRules.chargeFrequency se
                    // guarda en minúsculas (ej. "weekly", "daily") en la base de datos
                    "chargeRules.chargeFrequency": !isEmpty(chargeFrequency) ? { $in: chargeFrequency.map((f) => f.toLowerCase()) } : undefined
                }, (value) => {
                    return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
                }) as QueryFilter<ICredits>
            },
            customerFilters: {
                ...omitBy({
                    //userId: new Types.ObjectId(get(filters, "userId", ""))
                    $or: !isEmpty(generalSearch) ? [
                        { "contact.name": { $regex: new RegExp(generalSearch, 'i') } },
                        { "contact.lastName": { $regex: new RegExp(generalSearch, 'i') } },
                        { "contact.address": { $regex: new RegExp(generalSearch, 'i') } },
                        { "contact.phoneNumber": { $regex: new RegExp(generalSearch, 'i') } },
                    ] : undefined
                }, (value) => {
                    return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
                }) as QueryFilter<ICustomers>
            }
        }
    },
    [UserRoleEnum.CREDIT_COLLECTOR]: (filters: FiltersItems, authorizationContext: AuthorizationContext) => {
        const generalSearch: string = get(filters, "generalSearch", "");
        const chargeFrequency: string[] = get(filters, "chargeFrequency", []);
        return {
            creditsFilters: {
                // CREDIT_COLLECTOR: creditorCompanyId y userId salen exclusivamente del
                // JWT — nunca del request, sin importar lo que venga en filters.
                creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
                userId: new Types.ObjectId(get(authorizationContext, "userId", "000000000000000000000000")),
                status: CreditStatusEnum.CHARGE_PROCESS,
                transactionStatus: TransactionStatusEnum.APPROVED,
                ...omitBy({
                    // Se normaliza a minúsculas por la misma razón que en MANAGER
                    "chargeRules.chargeFrequency": !isEmpty(chargeFrequency) ? { $in: chargeFrequency.map((f) => f.toLowerCase()) } : undefined
                }, (value) => {
                    return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
                }) as QueryFilter<ICredits>
            },
            customerFilters: {
                ...omitBy({
                    //userId: new Types.ObjectId(get(filters, "userId", ""))
                    $or: !isEmpty(generalSearch) ? [
                        { "contact.name": { $regex: new RegExp(generalSearch, 'i') } },
                        { "contact.lastName": { $regex: new RegExp(generalSearch, 'i') } },
                        { "contact.address": { $regex: new RegExp(generalSearch, 'i') } },
                        { "contact.phoneNumber": { $regex: new RegExp(generalSearch, 'i') } },
                    ] : undefined
                }, (value) => {
                    return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
                }) as QueryFilter<ICustomers>
            }
        }
    }
}

// ADMIN reutiliza el mismo filtro que MANAGER (visibilidad total de la empresa)
UserRoleEmployeeCatalog[UserRoleEnum.ADMIN] = UserRoleEmployeeCatalog[UserRoleEnum.MANAGER]!;
