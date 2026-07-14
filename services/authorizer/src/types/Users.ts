export interface Users {
    contact?:          Contact;
    created?:          number;
    creditorCompanyId: string;
    email?:            string;
    password?:         string;
    roles?:            string[];
    status?:           string;
    userName?:         string;
}

export interface Contact {
    adress?:      string;
    lastName?:    string;
    name?:        string;
    phoneNumber?: string;
}
