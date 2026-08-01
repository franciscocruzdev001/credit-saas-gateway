export interface SearchTransactionsByUserRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    accountNumber:     string;
    creditorCompanyId: string;
    walletId:          string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
