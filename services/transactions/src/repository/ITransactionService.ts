import { Observable } from 'rxjs';
import { SearchTransactionsRequest } from '../types/SearchTransactionsRequest';
import { SearchTransactionsByUserRequest } from '../types/SearchTransactionsByUserRequest';
import { CreateTransactionByEmployeeRequest } from '../types/CreateTransactionByEmployeeRequest';
import { AuthorizationContext } from '../types/AuthorizationContext';

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
  /**
    * Create a Transaction started by an employee — siempre nace en PENDING,
    * queda a la espera de aprobación por un admin
    */
  createTransactionByEmployee(
    transactionData: CreateTransactionByEmployeeRequest,
    authorizationContext: AuthorizationContext
  ): Observable<boolean>
}