export interface Customers {
    contact?:             Object;
    created?:             number;
    creditorCompanyId:    string;
    status?:              string;
    threeWordsUbication?: string;
    userId:               string;
}

export interface Object {
    adress?:      string;
    lastName?:    string;
    name?:        string;
    phoneNumber?: string;
    [property: string]: any;
}
