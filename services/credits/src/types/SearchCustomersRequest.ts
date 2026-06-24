export interface SearchCustomersRequest {
    createdByEmployeeId: string;
    pagination:          Pagination;
    status:              string[];
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
