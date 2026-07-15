import { Observable } from 'rxjs';
import { Users } from '../types/Users';

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
}