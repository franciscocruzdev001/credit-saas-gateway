import { Observable } from 'rxjs';
import { SearchFilterPaymentsRequest } from '../types/SearchFilterPaymentsRequest';


export interface IPaymentService {
  /**
    * test auth funtion
    */
  searchPayments(): Observable<Object>

  /**
   * Searches customer payments based on the provided filters.
   */
  searchFilterPayments(
    searchCustomerData: SearchFilterPaymentsRequest
  ): Observable<Object>

}