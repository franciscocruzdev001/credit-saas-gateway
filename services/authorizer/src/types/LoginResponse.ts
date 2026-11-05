export interface LoginResponse {
    token: string;
    user:  User;
}

export interface User {
    _id:                  string;
    accountNumber?:       string;
    creditorCompanyId:    string;
    creditorCompanyInfo?: CreditorCompanyInfo;
    email:                string;
    permissions:          string[];
    roles:                string[];
    userName:             string;
    walletId?:            string;
    walletSnapshot:       WalletSnapshot;
}

export interface CreditorCompanyInfo {
    _id:          string;
    chargeRules?: CreditorCompanyChargeRules[];
    companyName:  string;
    email:        string;
    phoneNumber:  string;
    socialReason: string;
}

export interface CreditorCompanyChargeRules {
    chargeDay?:         string;
    chargeFrequency?:   string;
    chargePeriods?:     number;
    comissionRate?:     number;
    firstCharge?:       boolean;
    latePaymentCharge?: number;
    renovationPeriod?:  number;
}

/**
 * Foto del saldo de la wallet al momento del login: el front la usa para inicializar su
 * cartera local y luego la reconcilia con /getWalletInfo (el servidor siempre tiene
 * prioridad)
 */
export interface WalletSnapshot {
    firmBalance:            number;
    pendingExpensesBalance: number;
    pendingIncomesBalance:  number;
    /**
     * Epoch millis (Date.now()) del momento exacto en que se consulto este saldo
     */
    queriedAt: number;
}
