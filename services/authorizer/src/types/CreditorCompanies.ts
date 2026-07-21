export interface CreditorCompanies {
    chargeRules?:  ChargeRules[];
    companyName?:  string;
    created?:      number;
    email?:        string;
    phoneNumber?:  string;
    socialReason?: string;
}

export interface ChargeRules {
    chargeFrequency?:  string;
    chargePeriods?:    string;
    comissionRate?:    number;
    renovationPeriod?: number;
}
