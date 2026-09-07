import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import { QueryFilter, Types } from "mongoose";
import { UserRoleEnum } from "../UserRoleEnum";
import { ICustomers } from "../../schema/mongodb/models/Customers.Model";
import { AuthorizationContext } from "../../types/AuthorizationContext";
import { FiltersItems } from "../../types/SearchCustomersByEmployeeRequest";

// Autocomplete de "customers" 
// clientes de la empresa, CREDIT_COLLECTOR solo los suyos.
export const UserRoleCustomerSearchCatalog: Record<string, (filters: FiltersItems, authorizationContext: AuthorizationContext) => QueryFilter<ICustomers>> = {
    [UserRoleEnum.MANAGER]: (filters: FiltersItems, authorizationContext: AuthorizationContext) => {
        const generalSearch: string = get(filters, "generalSearch", "");
        return {
            creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
            ...omitBy({
                $or: !isEmpty(generalSearch) ? [
                    { "contact.name": { $regex: new RegExp(generalSearch, 'i') } },
                    { "contact.lastName": { $regex: new RegExp(generalSearch, 'i') } },
                    { "contact.phoneNumber": { $regex: new RegExp(generalSearch, 'i') } },
                ] : undefined
            }, (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            })
        } as QueryFilter<ICustomers>;
    },
    [UserRoleEnum.CREDIT_COLLECTOR]: (filters: FiltersItems, authorizationContext: AuthorizationContext) => {
        const generalSearch: string = get(filters, "generalSearch", "");
        return {
            // CREDIT_COLLECTOR: creditorCompanyId y userId salen exclusivamente
            // del JWT — nunca del body, sin importar lo que venga en filters.
            creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
            userId: new Types.ObjectId(get(authorizationContext, "userId", "000000000000000000000000")),
            ...omitBy({
                $or: !isEmpty(generalSearch) ? [
                    { "contact.name": { $regex: new RegExp(generalSearch, 'i') } },
                    { "contact.lastName": { $regex: new RegExp(generalSearch, 'i') } },
                    { "contact.phoneNumber": { $regex: new RegExp(generalSearch, 'i') } },
                ] : undefined
            }, (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            })
        } as QueryFilter<ICustomers>;
    }
}

// ADMIN reutiliza el mismo filtro que MANAGER (visibilidad total de la empresa)
UserRoleCustomerSearchCatalog[UserRoleEnum.ADMIN] = UserRoleCustomerSearchCatalog[UserRoleEnum.MANAGER]!;
