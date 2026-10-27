export interface Incidents {
    creditorCompanyId: string;
    creditId:          string;
    customerId:        string;
    latePaymentCharge?: number;
    description?:      string;
    currency?:         string;
}
