export interface Credits {
    admissionDate?:            number;
    chargeRules?:              Object;
    created?:                  number;
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

export interface Object {
    chargeFrequency?:  string;
    chargePeriods?:    number;
    comissionRate?:    number;
    renovationPeriod?: number;
    [property: string]: any;
}
