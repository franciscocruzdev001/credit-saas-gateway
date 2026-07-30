export interface Transactions {
    created?:            number;
    creditIdSource?:     string;
    currency?:           string;
    description?:        string;
    destinationAccount?: DestinationAccount;
    sourceAccount?:      SourceAccount;
    status?:             string;
    total?:              number;
    transactionType?:    string;
}

export interface DestinationAccount {
    accountNumber?: string;
    walletId:       string;
}

export interface SourceAccount {
    accountNumber?: string;
    walletId:       string;
}
