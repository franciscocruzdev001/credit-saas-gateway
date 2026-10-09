export interface GetCreditSummaryRequest {
    fromTimestamp: number;
    toTimestamp:   number;
    filtersItems?: FiltersItems;
}

export interface FiltersItems {
    userId?: string;
}
