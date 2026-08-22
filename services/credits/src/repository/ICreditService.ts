import { Observable } from 'rxjs';
import { SearchCustomersRequest } from '../types/SearchCustomersRequest';
import { SearchEmployeesRequest } from '../types/SearchEmployeesRequest';
import { SearchCreditsRequest } from '../types/SearchCreditsRequest';
import { SearchCreditsByEmployeeRequest } from '../types/SearchCreditsByEmployeeRequest';
import { GetPaymentRequest } from '../types/GetPaymentRequest';
import { GetWalletRequest } from '../types/GetWalletRequest';
import { Customers } from '../types/Customers';
import { Credits } from '../types/Credits';

export interface ICreditService {
  /**
   * Create credit by employee (manager, creditCollector)
   */
  createCreditsByEmployee(
    creditCustomer: {
      customer?: Customers,
      credit: Credits
    }
  ): Observable<boolean>

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

  getPaymentByCredit(request: GetPaymentRequest): Observable<Object>;

  getWalletInfo(request: GetWalletRequest): Observable<Object>;
}