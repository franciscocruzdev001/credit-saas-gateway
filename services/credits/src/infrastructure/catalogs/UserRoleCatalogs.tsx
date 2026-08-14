import { QueryFilter, Types } from "mongoose";
import { UserRoleEnum } from "../UserRoleEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import { FiltersItems } from "../../types/SearchCreditsByEmployeeRequest";
import { ICustomers } from "../../schema/mongodb/models/Customers.Model";
import { CreditStatusEnum } from "../CreditStatusEnum";
import { TransactionStatusEnum } from "../TransactionStatusEnum";


export const UserRoleEmployeeCatalog: Record<string, (filters: FiltersItems) => {
    creditsFilters: QueryFilter<ICredits>,
    customerFilters: QueryFilter<ICustomers>
}> = {
    [UserRoleEnum.MANAGER]: (filters: FiltersItems) => {
        const generalSearch: string = get(filters, "generalSearch", "");
        const userId: string = get(filters, "userId", "");
        const chargeFrequency: string[] = get(filters, "chargeFrequency", []);
        return {
            creditsFilters: {
                creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "000000000000000000000000")),
                status: CreditStatusEnum.CHARGE_PROCESS,
                transactionStatus: TransactionStatusEnum.APPROVED,
                ...omitBy({
                    //status: get(searchCreditsData, "status", undefined),
                    userId: !isEmpty(userId) ? new Types.ObjectId(get(filters, "userId", "")) : undefined,
                    // Filtro para los botones de "créditos semanales/diarios" en mobile
                    "chargeRules.chargeFrequency": !isEmpty(chargeFrequency) ? { $in: chargeFrequency } : undefined
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
    [UserRoleEnum.CREDIT_COLLECTOR]: (filters: FiltersItems) => {
        const generalSearch: string = get(filters, "generalSearch", "");
        const chargeFrequency: string[] = get(filters, "chargeFrequency", []);
        return {
            creditsFilters: {
                creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "000000000000000000000000")),
                userId: new Types.ObjectId(get(filters, "userId", "000000000000000000000000")),
                status: CreditStatusEnum.CHARGE_PROCESS,
                transactionStatus: TransactionStatusEnum.APPROVED,
                ...omitBy({
                    // Filtro para los botones de "créditos semanales/diarios" en mobile
                    "chargeRules.chargeFrequency": !isEmpty(chargeFrequency) ? { $in: chargeFrequency } : undefined
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