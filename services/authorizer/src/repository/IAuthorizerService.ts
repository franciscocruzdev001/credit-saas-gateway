import { Observable } from 'rxjs';

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
  createUser(): Observable<boolean>
}