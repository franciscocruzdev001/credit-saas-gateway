import { Observable } from 'rxjs';

export interface IPaymentService {
    /**
      * test auth funtion
      */
    searchPayments(): Observable<Object>
}