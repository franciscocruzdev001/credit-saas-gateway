export interface Incidents {
    creditId:           string;
    creditorCompanyId:  string;
    currency?:          string;
    customerId:         string;
    description?:       string;
    latePaymentCharge?: number;
}
