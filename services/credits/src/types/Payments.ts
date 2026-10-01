import { PaymentCategoryEnum } from "../infrastructure/PaymentCategoryEnum";

export interface Payments {
    creditId: string;
    customerId: string;
    paymentMethod?: string;
    total?: number;
    transactionId: string;
    transactionStatus?: string;
    paymentCategory?: PaymentCategoryEnum; 
}
