import { Observable } from 'rxjs';

export interface ITransactionService {
    /**
      * test auth funtion
      */
    searchTransactions(): Observable<Object>
}