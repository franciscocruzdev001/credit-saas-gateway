export interface SearchTransactionsByUserRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    accountNumber:     string;
    createdRangeDate?: CreatedRangeDate;
    creditorCompanyId: string;
    walletId:          string;
}

export interface CreatedRangeDate {
    endDate?:   string;
    startDate?: string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
