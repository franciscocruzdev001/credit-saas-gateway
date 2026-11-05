export interface Customers {
    aval?:               Aval;
    contact:             Contact;
    created?:            number;
    creditorCompanyId:   string;
    status?:             string;
    threeWordsUbication: string;
    userId:              string;
}

export interface Aval {
    contact: Contact;
    /**
     * Si el aval ya es un customer registrado
     */
    customerId?: string;
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
