import { QueryFilter, Types } from "mongoose";
import { UserRoleEnum } from "../UserRoleEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { FiltersItems } from "../../types/SearchCreditsRequest";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";



export const UserRoleEmployeeCatalog: Record<string, (filters: FiltersItems) => QueryFilter<ICredits>> = {
    [UserRoleEnum.MANAGER]: (filters: FiltersItems) => {
        return {
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "")),
            ...omitBy({
                //status: get(searchCreditsData, "status", undefined),
                userId: new Types.ObjectId(get(filters, "userId", ""))
            }, (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            }) as QueryFilter<ICredits>
        }
    },
    [UserRoleEnum.CREDIT_COLLECTOR]: (filters: FiltersItems) => {
        return {
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "")),
            userId: new Types.ObjectId(get(filters, "userId", ""))
        }
    }
}