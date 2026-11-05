export interface GetCreditTotalsRequest {
    filtersItems:  FiltersItems;
    fromTimestamp: number;
    toTimestamp:   number;
}

export interface FiltersItems {
    chargeFrequency?: ChargeFrequency[];
    userId?:          string;
}

export enum ChargeFrequency {
    Daily = "daily",
    Weekly = "weekly",
}
