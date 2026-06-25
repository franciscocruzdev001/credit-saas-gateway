import { Filter, FindOptions, Document } from 'mongodb';
import { Observable } from 'rxjs';
/**
 * Logic gateway to connect MongoDB
 */
export interface IMongoGateway {
  /**
   * Close Connection MongoDB
   */
  disconnect(): Observable<boolean>
  /**
  * find all documents from collection
  */
  findAllDocuments(dbName: string, collectionName: string): Observable<Document[]>
  /**
  * find multiple documents from collection based on a filter
  */
  findDocuments(
    dbName: string,
    collectionName: string,
    queryfilter: Filter<Document>,
    options?: FindOptions
  ): Observable<Document[]>;
  /**
  * find firs document from collection based on a filter
  */
  findFistDocument(
    dbName: string,
    collectionName: string,
    queryfilter: Filter<Document>
  ): Observable<Document | null>;
  /**
  * find document from collection based on a OptionId
  */
  findByIdDocument(
    dbName: string,
    collectionName: string,
    documentId: string
  ): Observable<Document | null>;
  /**
   * Create document to collection
   */
  create(
    dbName: string,
    collectionName: string,
    doc: Document
  ): Observable<boolean>;
  /**
   * Update document by id to collection
   */
  update(
    dbName: string,
    collectionName: string,
    documentId: string,
    updateFields: Partial<Document>
  ): Observable<boolean>;
  /**
   * Remove document by id to collection
   */
  remove(
    dbName: string,
    collectionName: string,
    documentId: string
  ): Observable<boolean>;
}