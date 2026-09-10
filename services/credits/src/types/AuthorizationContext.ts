export interface AuthorizationContext {
    userId:            string;
    creditorCompanyId: string;
    roles?:            string[];
    walletId?:         string;
    accountNumber?:    string;
}

