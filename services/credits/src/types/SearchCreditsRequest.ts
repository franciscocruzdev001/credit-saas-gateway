export interface SearchCreditsRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    creditorCompanyId:  string;
    customerId?:        string;
    status?:            string[];
    transactionStatus?: string[];
    userId?:            string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
