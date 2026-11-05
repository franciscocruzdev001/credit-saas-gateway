export interface AuthorizationContext {
    accountNumber?:    string;
    creditorCompanyId: string;
    roles?:            string[];
    userId:            string;
    walletId?:         string;
}
