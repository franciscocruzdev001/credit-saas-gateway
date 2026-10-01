export interface Customers {
    contact:             Contact;
    aval?:               Aval;
    created?:            number;
    creditorCompanyId:   string;
    status?:             string;
    threeWordsUbication: string;
    userId:              string;
}

export interface Aval {
    // Si el aval ya es un customer registrado
    customerId?: string;
    contact:     Contact;
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
