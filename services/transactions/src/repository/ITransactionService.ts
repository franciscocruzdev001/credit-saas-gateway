import { Observable } from 'rxjs';
import { SearchTransactionsRequest } from '../types/SearchTransactionsRequest';
import { SearchTransactionsByUserRequest } from '../types/SearchTransactionsByUserRequest';

export interface ITransactionService {
  /**
    * Search Transactions by fields filters  
    */
  searchTransactions(
    searchTransactionData: SearchTransactionsRequest
  ): Observable<Object>
  /**
    * Search Transactions by fields filters to userId
    */
  searchTransactionsByUser(
    searchTransactionData: SearchTransactionsByUserRequest
  ): Observable<Object>
}