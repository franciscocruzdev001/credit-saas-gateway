export interface AuthorizationContext {
    userId:            string;
    creditorCompanyId: string;
    roles?:            string[];
    walletId?:         string;
    accountNumber?:    string;
}

/***
 * quicktype -s schema ./src/schema/authorization_context.json --just-types --lang ts -o ./src/types/AuthorizationContext.ts
 */
