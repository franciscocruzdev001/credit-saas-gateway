export interface Transactions {
    created?:            number;
    creditIdSource?:     string;
    currency?:           string;
    description?:        string;
    destinationAccount?: DestinationAccountObject;
    sourceAccount?:      SourceAccountObject;
    status?:             string;
    total?:              number;
    transactionType?:    string;
}

export interface DestinationAccountObject {
    accountNumber?: string;
    walletId:       string;
    [property: string]: any;
}

export interface SourceAccountObject {
    accountNumber?: string;
    walletId:       string;
    [property: string]: any;
}
