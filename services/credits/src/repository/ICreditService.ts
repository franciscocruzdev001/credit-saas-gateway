import { Observable } from 'rxjs';
import { SearchCustomersRequest } from '../types/SearchCustomersRequest';

export interface ICreditService {
    /**
      * test auth funtion
      */
    searchCredits(): Observable<Object>
    /**
      * Search customers by fields filters 
      */
    searchCustomer(
      searchCustomerData: SearchCustomersRequest
    ): Observable<Object>
}