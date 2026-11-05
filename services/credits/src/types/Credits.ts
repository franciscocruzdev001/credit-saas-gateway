import { OldDayEnum } from "../infrastructure/OldDayEnum";

export interface Credits {
    admissionDate?:            number;
    amountDue?:                number;
    amountMoratory?:           number;
    amountPaid?:               number;
    amountPaidMoratory?:       number;
    /**
     * Fecha en la que 'status' cambio por ultima vez
     */
    changeDateStatus?:         number;
    chargeRules?:              ChargeRules;
    created?:                  number;
    creationStatus?:           CreationStatus;
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
    startDateChargeConfig?:    number;
    status?:                   string;
    transactionId:             string;
    transactionStatus?:        TransactionStatus;
    userId:                    string;
}

export interface ChargeRules {
    chargeDay?:         OldDayEnum;
    chargeFrequency?:   string;
    chargePeriods?:     number;
    comissionRate?:     number;
    firstCharge?:       boolean;
    latePaymentCharge?: number;
    renovationPeriod?:  number;
}

export enum CreationStatus {
    New = "new",
    Renewed = "renewed",
}

export enum TransactionStatus {
    Approved = "approved",
    Cancelled = "cancelled",
    Pending = "pending",
}
