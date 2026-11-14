export interface Credits {
    admissionDate?:      number;
    amountDue?:          number;
    amountMoratory?:     number;
    amountPaid?:         number;
    amountPaidMoratory?: number;
    /**
     * Fecha en la que 'status' cambio por ultima vez
     */
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
    /**
     * Se precarga con la fecha del ultimo reporte de cobro realizado al cobrador
     */
    startDateChargeConfig?: number;
    status?:                string;
    transactionId:          string;
    transactionStatus?:     string;
    userId:                 string;
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
