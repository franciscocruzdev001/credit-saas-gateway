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
import { GetCreditSummaryRequest } from '../types/GetCreditSummaryRequest';
import { GetCreditPaymentsAndIncidentsRequest } from '../types/GetCreditPaymentsAndIncidentsRequest';

export interface ICreditService {
  /**
   * Create credit by employee (manager, creditCollector)
   * Regresa creditId y customerId del crédito creado — vacíos ("") si no se pudo crear
   */
  createCreditsByEmployee(
    creditCustomer: {
      customer?: Customers,
      credit: Credits
    },
    authorizationContext: AuthorizationContext
  ): Observable<{ creditId: string, customerId: string }>
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

  /**
   * Historial de un crédito: pagos confirmados mayores a $0 e incidencias
   * (faltas), en dos listas independientes.
   */
  getCreditPaymentsAndIncidents(
    request: GetCreditPaymentsAndIncidentsRequest,
    authorizationContext: AuthorizationContext
  ): Observable<Object>;

  getWalletInfo(request: GetWalletRequest): Observable<Object>;

  getCreditTotals(
    request: GetCreditTotalsRequest,
    authorizationContext: AuthorizationContext
  ): Observable<Object>;
  
  /**
   * Resumen de métricas del cobrador (solo conteos): créditos cobrados,
   * nuevos y renovaciones, agrupados por chargeFrequency.
   */
  getCreditSummary(
    request: GetCreditSummaryRequest,
    authorizationContext: AuthorizationContext
  ): Observable<Object>;
}