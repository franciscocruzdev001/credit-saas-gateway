import { Observable } from 'rxjs';
import { SearchCustomersRequest } from '../types/SearchCustomersRequest';
import { SearchEmployeesRequest } from '../types/SearchEmployeesRequest';
import { SearchCreditsRequest } from '../types/SearchCreditsRequest';
import { SearchCreditsByEmployeeRequest } from '../types/SearchCreditsByEmployeeRequest';

export interface ICreditService {
  /**
   * Create credit 
   */
  
  /**
    *  Search credits by fields filters 
    */
  searchCredits(
    searchCreditsData: SearchCreditsRequest
  ): Observable<Object>
  /**
    *  Search credits by fields filters to employee
    */
  searchCreditsByEmployee(
    searchCreditsData: SearchCreditsByEmployeeRequest
  ): Observable<Object>
  /**
    * Search customers by fields filters 
    */
  searchCustomer(
    searchCustomerData: SearchCustomersRequest
  ): Observable<Object>
}