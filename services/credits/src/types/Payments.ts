import { PaymentCategoryEnum } from "../infrastructure/PaymentCategoryEnum";
import { PaymentSubTypeEnum } from "../infrastructure/PaymentSubTypeEnum";

export interface Payments {
    creditId: string;
    customerId: string;
    paymentMethod?: string;
    total?: number;
    transactionId: string;
    transactionStatus?: string;
    paymentCategory?: PaymentCategoryEnum;
    paymentSubType?: PaymentSubTypeEnum;
}
