import { Observable } from 'rxjs';
import { Users } from '../types/Users';
import { ChargeReportLogs } from '../types/ChargeReportLogs';
import { CreditorCompanies } from '../types/CreditorCompanies';

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
  createChargeReportLogs(chargeReportLogsData:ChargeReportLogs ):Observable<boolean>
  createCreditorCompanies(creditorCompaniesData: CreditorCompanies):Observable<boolean>
}