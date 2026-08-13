import { DestinationAccount, SourceAccount } from "./Transactions";

export interface CreateTransactionByEmployeeRequest {
    transactionType:    string;
    total:               number;
    description?:        string;
    currency:            string;
    sourceAccount:       SourceAccount;
    destinationAccount:  DestinationAccount;
    creditIdSource?:     string;
    creditorCompanyId:   string;
}
