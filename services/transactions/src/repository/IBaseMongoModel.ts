import { UpdateQuery, AnyObject, QueryFilter, QueryOptions } from 'mongoose';
import { Observable } from 'rxjs';

export interface IBaseMongoModel<T> {
  /**
   * Find all documents from collection Mongo
   */
  findAllDocuments(): Observable<{ documents: T[], totalDocuments: number }>;
  /**
  * find multiple documents from collection based on a filter
  */
  findDocuments(
    queryfilter: QueryFilter<T>,
    options?: QueryOptions
  ): Observable<{ documents: T[], totalDocuments: number }>;
  /**
  * find multiple documents from collection based on a filter
  */
  findByIdDocument(
    documentId: string
  ): Observable<T | null>;
  /**
   * Create document to collection
   */
  create(
    document: Partial<T>
  ): Observable<boolean>;
  /**
   * Update document by id to collection
   */
  update(
    documentId: string,
    updateFields: UpdateQuery<T>
  ): Observable<boolean>;
  /**
   * Remove document by id to collection
   */
  remove(
    documentId: string
  ): Observable<boolean>;
}