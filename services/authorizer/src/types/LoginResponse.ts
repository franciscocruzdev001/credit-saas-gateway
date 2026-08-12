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
}

export interface CreditorCompanyInfo {
    _id:          string;
    companyName:  string;
    email:        string;
    phoneNumber:  string;
    socialReason: string;
}
