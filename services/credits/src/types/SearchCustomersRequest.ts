export interface SearchCustomersRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    createdByEmployeeId?: string;
    creditorCompanyId?:   string;
    generalSearch?:       string;
    status?:              string[];
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
