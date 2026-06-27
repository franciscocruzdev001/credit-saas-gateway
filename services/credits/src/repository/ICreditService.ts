import { Observable } from 'rxjs';
import { SearchCustomersRequest } from '../types/SearchCustomersRequest';
import { SearchEmployeesRequest } from '../types/SearchEmployeesRequest';

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

  /**
    * Search Employees by fields filters 
    */
  searchEmployees(
    searchEmployeeData: SearchEmployeesRequest
  ): Observable<Object>


}