export interface SearchCreditsByEmployeeRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    creditorCompanyId: string;
    userId:            string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
