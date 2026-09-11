export interface LoginResponse {
    token: string;
    user:  User;
}

export interface User {
    _id:                  string;
    creditorCompanyId:    string;
    creditorCompanyInfo?: CreditorCompanyInfo;
    email:                string;
    permissions:          string[];
    roles:                string[];
    userName:             string;
    walletId?:            string;
    walletSnapshot:       WalletSnapshot;
}

// Foto del saldo de la wallet al momento del login — el front la usa para
// inicializar su "cartera local" y luego la reconcilia cada vez que vuelve a
// consultar /getWalletInfo (el servidor siempre tiene prioridad sobre lo local).
export interface WalletSnapshot {
    firmBalance:            number;
    pendingIncomesBalance:  number;
    pendingExpensesBalance: number;
    // Epoch millis (Date.now()) del momento exacto en que se consultó este saldo.
    queriedAt:               number;
}

export interface CreditorCompanyInfo {
    _id:          string;
    companyName:  string;
    email:        string;
    phoneNumber:  string;
    socialReason: string;
    chargeRules?: CreditorCompanyChargeRules[];
}

export interface CreditorCompanyChargeRules {
    chargeFrequency?:  string;
    chargePeriods?:    number;
    chargeDay?:        string;
    renovationPeriod?: number;
    comissionRate?:    number;
}
