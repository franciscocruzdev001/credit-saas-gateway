import { forkJoin, from, map, mergeMap, Observable, of, switchMap } from "rxjs";
import { IMongoGateway } from "../repository/IMongoGateway";
import {
    Filter,
    FindOptions,
    InsertOneResult,
    MongoClient,
    ObjectId,
    Document,
    UpdateFilter,
    UpdateResult,
    DeleteResult,
    Collection
} from "mongodb";

export class MongoGateway implements IMongoGateway {
    //constructor(@inject)
    private _mongoClient: MongoClient | null = null;

    private _getClient(): Observable<MongoClient> {
        console.log("_getClient");
        if (this._mongoClient) {
            return of(1).pipe(map(() => <MongoClient>this._mongoClient));
        }

        console.log("_getClient-mongoURL: mongodb://localhost:27017");

        this._mongoClient = new MongoClient("mongodb://localhost:27017");
        return of(this._mongoClient).pipe(
            mergeMap((mongoClient: MongoClient) => mongoClient.connect()),
            map((mongoClient: MongoClient) => mongoClient)
        );
    }

    public disconnect(): Observable<boolean> {
        if (this._mongoClient === null) {
            return of(true);
        }
        return of(this._mongoClient).pipe(
            mergeMap((mongoClient: MongoClient) => mongoClient.close()),
            map(() => true)
        );
    }

    public findAllDocuments(dbName: string, collectionName: string): Observable<Document[]> {
        console.log("findAllDocuments-dbName: ", dbName);
        console.log("findAllDocuments-collectionName: ", collectionName);
        return of(true).pipe(
            mergeMap(() => this._getClient()),
            switchMap((mongoClient: MongoClient) =>
                from(
                    mongoClient.
                        db(dbName).
                        collection<Document>(collectionName).
                        find().
                        toArray()
                )
            )
        );
    }

    public findDocuments(
        dbName: string,
        collectionName: string,
        queryfilter: Filter<Document>,
        options?: FindOptions
    ): Observable<{ documents: Document[], totalDocuments: number }> {
        return of(true).pipe(
            mergeMap(() => this._getClient()),
            map((mongoClient: MongoClient) =>
                mongoClient.
                    db(dbName).
                    collection<Document>(collectionName)
            ),
            switchMap((collection: Collection<Document>) => {

                return forkJoin({
                    documents: from(
                        collection.
                            find(queryfilter, options).
                            toArray()
                    ),
                    totalDocuments: collection.countDocuments(queryfilter)
                })
            }),
        );
    }

    public findByIdDocument(
        dbName: string,
        collectionName: string,
        documentId: string
    ): Observable<Document | null> {
        const queryfilter = {
            _id: new ObjectId(documentId)
        } as unknown as Filter<Document>;
        return of(true).pipe(
            mergeMap(() => this._getClient()),
            mergeMap((mongoClient: MongoClient) =>
                mongoClient.
                    db(dbName).
                    collection<Document>(collectionName).
                    findOne(queryfilter)
            )
        );
    }

    public create(
        dbName: string,
        collectionName: string,
        doc: Document
    ): Observable<boolean> {
        return of(true).pipe(
            mergeMap(() => this._getClient()),
            mergeMap((mongoClient: MongoClient) =>
                mongoClient.
                    db(dbName).
                    collection<Document>(collectionName).
                    insertOne(doc)
            ),
            map((result: InsertOneResult) => {
                return result.insertedId !== null ? true : false;
            })
        );
    }

    public update(
        dbName: string,
        collectionName: string,
        documentId: string,
        updateFields: Partial<Document>
    ): Observable<boolean> {
        const queryfilter = {
            _id: new ObjectId(documentId)
        } as unknown as Filter<Document>;

        const updateQuery = {
            $set: updateFields
        } as UpdateFilter<Document>;

        return of(true).pipe(
            mergeMap(() => this._getClient()),
            mergeMap((mongoClient: MongoClient) =>
                mongoClient.
                    db(dbName).
                    collection<Document>(collectionName).
                    updateOne(queryfilter, updateQuery)
            ),
            map((result: UpdateResult) => {
                return result.modifiedCount > 0 ? true : false;
            })
        );
    }

    public remove(
        dbName: string,
        collectionName: string,
        documentId: string
    ): Observable<boolean> {
        const queryfilter = {
            _id: new ObjectId(documentId)
        } as unknown as Filter<Document>;
        return of(true).pipe(
            mergeMap(() => this._getClient()),
            mergeMap((mongoClient: MongoClient) =>
                mongoClient.
                    db(dbName).
                    collection<Document>(collectionName).
                    deleteOne(queryfilter)
            ),
            map((result: DeleteResult) => {
                return result.deletedCount > 0 ? true : false;
            })
        );
    }
}