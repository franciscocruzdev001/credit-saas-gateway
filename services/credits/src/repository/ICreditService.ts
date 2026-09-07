import { Observable } from 'rxjs';
import { SearchCustomersRequest } from '../types/SearchCustomersRequest';
import { SearchEmployeesRequest } from '../types/SearchEmployeesRequest';
import { SearchCreditsRequest } from '../types/SearchCreditsRequest';
import { SearchCreditsByEmployeeRequest } from '../types/SearchCreditsByEmployeeRequest';
import { SearchCustomersByEmployeeRequest } from '../types/SearchCustomersByEmployeeRequest';
import { GetPaymentRequest } from '../types/GetPaymentRequest';
import { GetWalletRequest } from '../types/GetWalletRequest';
import { Customers } from '../types/Customers';
import { Credits } from '../types/Credits';
import { Payments } from '../types/Payments';
import { AuthorizationContext } from '../types/AuthorizationContext';
import { GetCreditTotalsRequest } from '../types/GetCreditTotalsRequest';

export interface ICreditService {
  /**
   * Create credit by employee (manager, creditCollector)
   */
  createCreditsByEmployee(
    creditCustomer: {
      customer?: Customers,
      credit: Credits
    },
    authorizationContext: AuthorizationContext
  ): Observable<boolean>
  /**
   * Create payment by employee (manager, creditCollector)
   */
  createPaymentsByEmployee(
    paymentRequest: Payments,
    authorizationContext: AuthorizationContext
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
    searchCreditsData: SearchCreditsByEmployeeRequest,
    authorizationContext: AuthorizationContext
  ): Observable<Object>
  /**
    * Search customers by fields filters
    */
  searchCustomer(
    searchCustomerData: SearchCustomersRequest
  ): Observable<Object>
  /**
    * Search customers assigned to the authenticated employee (cobrador) —
    * usado por el autocomplete de "cliente existente" al crear un crédito.
    */
  searchCustomersByEmployee(
    searchCustomerData: SearchCustomersByEmployeeRequest,
    authorizationContext: AuthorizationContext
  ): Observable<Object>

  getPaymentByCredit(request: GetPaymentRequest): Observable<Object>;

  getWalletInfo(request: GetWalletRequest): Observable<Object>;

  getCreditTotals(
    request: GetCreditTotalsRequest,
    authorizationContext: AuthorizationContext
  ): Observable<Object>;
}