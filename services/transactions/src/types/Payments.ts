export interface Payments {
    creditId:           string;
    customerId:         string;
    customerName?:      string;
    paymentCategory?:   string;
    paymentMethod?:     string;
    total?:             number;
    transactionId:      string;
    transactionStatus?: string;
}
