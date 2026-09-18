export interface Users {
    contact?:          Contact;
    created?:          number;
    creditorCompanyId: string;
    email:             string;
    password:          string;
    roles:             string[];
    status?:           string;
    userName:          string;
}

export interface Contact {
    address?:     string;
    lastName?:    string;
    name?:        string;
    phoneNumber?: string;
    ubication?:   Ubication;
}

export interface Ubication {
    latitude?:  string;
    longitude?: string;
}
