export interface Credits {
    admissionDate?:            number;
    amountDue?:                number;
    amountMoratory?:           number;
    amountPaid?:               number;
    amountPaidMoratory?:       number;
    changeDateStatus?:         number;
    chargeRules?:              ChargeRules;
    chargeStatus?:             string;
    created?:                  number;
    creationStatus?:           string;
    creditAmount?:             number;
    creditAmountWithMoratory?: number;
    creditorCompanyId:         string;
    customerId:                string;
    customerName?:             string;
    expirationDate?:           number;
    fixedCharge?:              number;
    lastPaymentDateApproved?:  number;
    startDateChargeConfig?:    number;
    status?:                   string;
    transactionId:             string;
    transactionStatus?:        string;
    userId:                    string;
}

export interface ChargeRules {
    chargeDay?:         string;
    chargeFrequency?:   string;
    chargePeriods?:     number;
    comissionRate?:     number;
    firstCharge?:       boolean;
    latePaymentCharge?: number;
    renovationPeriod?:  number;
}
