export interface LoginResponse {
    token: string;
    user:  User;
}

export interface User {
    _id:               string;
    creditorCompanyId: string;
    email:             string;
    permissions:       string[];
    roles:             string[];
    userName:          string;
}
