export interface CreditorCompanies {
    chargeRules?:  ChargeRules[];
    companyName?:  string;
    created?:      number;
    email?:        string;
    phoneNumber?:  string;
    socialReason?: string;
}

export interface ChargeRules {
    chargeDay?:        ChargeDay;
    chargeFrequency?:  string;
    chargePeriods?:    string;
    comissionRate?:    number;
    renovationPeriod?: number;
}

export enum ChargeDay {
    Friday = "friday",
    Monday = "monday",
    Saturday = "saturday",
    Sunday = "sunday",
    Thursday = "thursday",
    Tuesday = "tuesday",
    Wednesday = "wednesday",
}
