import { Observable } from 'rxjs';
import { SearchCustomersRequest } from '../types/SearchCustomersRequest';
import { SearchEmployeesRequest } from '../types/SearchEmployeesRequest';
import { SearchCreditsRequest } from '../types/SearchCreditsRequest';

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
    * Search customers by fields filters 
    */
  searchCustomer(
    searchCustomerData: SearchCustomersRequest
  ): Observable<Object>

  /**
    * Search Employees by fields filters 
    */
  searchEmployees(
    searchEmployeeData: SearchEmployeesRequest
  ): Observable<Object>


}