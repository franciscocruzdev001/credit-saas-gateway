export interface SearchCustomersRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    createdByEmployeeId?: string;
    status?:              string[];
    creditorCompanyId?:   string;
    generalSearch?:       string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
