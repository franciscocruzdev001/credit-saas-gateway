import { Observable } from 'rxjs';

export interface ICreditService {
    /**
      * test auth funtion
      */
    searchCredits(): Observable<Object>
}