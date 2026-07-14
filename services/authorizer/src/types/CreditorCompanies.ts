export interface CreditorCompanies {
    chargeRules?:  Array<any[] | boolean | number | number | null | ObjectObject | string>;
    companyName?:  string;
    created?:      number;
    email?:        string;
    phoneNumber?:  string;
    socialReason?: string;
}

export interface ObjectObject {
    chargeFrequency?:  string;
    chargePeriods?:    string;
    comissionRate?:    number;
    renovationPeriod?: number;
    [property: string]: any;
}
