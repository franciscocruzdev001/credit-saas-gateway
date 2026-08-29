import { FiltersItems } from "./SearchCreditsByEmployeeRequest";

export interface GetCreditTotalsRequest {
    fromTimestamp: number;
    toTimestamp:   number;
    filtersItems:  FiltersItems;
}
