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
}