import { Observable } from 'rxjs';
import { Users } from '../types/Users';
import { ChargeReportLogs } from '../types/ChargeReportLogs';
import { CreditorCompanies } from '../types/CreditorCompanies';
import { SearchEmployeesRequest } from '../types/SearchEmployeesRequest';
import { LoginRequest } from '../types/LoginRequest';
import { LoginResponse } from '../types/LoginResponse';


export interface IAuthorizerService {
  /**
   * test auth funtion
   */
  authorization(): Observable<boolean>
  /**
    * test auth funtion
    */
  test(): Observable<Object>
  /**
    * Create user with rol and contact information
    */
  createUser(userData: Users): Observable<boolean>
  createChargeReportLogs(chargeReportLogsData: ChargeReportLogs): Observable<boolean>
  createCreditorCompanies(creditorCompaniesData: CreditorCompanies): Observable<boolean>

  searchEmployees(
    searchEmployeeData: SearchEmployeesRequest
  ): Observable<Object>

  /**
   * Validates credentials (email/password) and returns a signed JWT
     along with basic user information, if they are correct
   */
  authorizer(loginData: LoginRequest): Observable<LoginResponse>
 
}