import { Observable } from 'rxjs';
import { SearchTransactionsRequest } from '../types/SearchTransactionsRequest';

export interface ITransactionService {
  /**
    * Search Transactions by fields filters  
    */
  searchTransactions(
    searchTransactionData: SearchTransactionsRequest
  ): Observable<Object>
}