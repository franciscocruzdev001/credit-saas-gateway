export interface SearchTransactionsRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    createdRangeDate?: CreatedRangeDate;
    creditorCompanyId: string;
    status:            string[];
}

export interface CreatedRangeDate {
    endDate?:   string;
    startDate?: string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
