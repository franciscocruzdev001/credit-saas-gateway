export interface SearchCreditsByEmployeeRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    creditorCompanyId: string;
    generalSearch?:    string;
    userId:            string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
