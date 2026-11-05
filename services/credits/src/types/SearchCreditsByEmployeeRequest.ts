export interface SearchCreditsByEmployeeRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    chargeFrequency?: string[];
    creditId?:        string;
    /**
     * Ya no se usa para construir creditsFilters (creditorCompanyId sale del JWT); se deja
     * opcional para no romper tipados existentes que la sigan enviando
     */
    creditorCompanyId?: string;
    generalSearch?:     string;
    transactionId?:     string;
    userId?:            string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
