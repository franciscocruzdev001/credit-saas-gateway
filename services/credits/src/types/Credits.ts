export interface Credits {
    admissionDate?:            number;
    amountDue?:                number;
    amountPaid?:               number;
    chargeRules?:              ChargeRules;
    created?:                  number;
    creationStatus?:           CreationStatus;
    creditAmount?:             number;
    creditAmountWithMoratory?: number;
    creditorCompanyId:         string;
    customerId:                string;
    expirationDate?:           number;
    fixedCharge?:              number;
    /**
     * Se precarga con la fecha del ultimo reporte de cobro realizado al cobrador
     */
    startDateChargeConfig?: number;
    status?:                string;
    transactionId:          string;
    userId:                 string;
}

export interface ChargeRules {
    chargeDay?:        ChargeDay;
    chargeFrequency?:  string;
    chargePeriods?:    number;
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

export enum CreationStatus {
    New = "new",
    Renewed = "renewed ",
}
