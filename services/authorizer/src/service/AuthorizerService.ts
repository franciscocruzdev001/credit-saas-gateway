import { map, mergeMap, Observable, of } from "rxjs";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document, Filter } from 'mongodb';

@injectable()
export class AuthorizerService implements IAuthorizerService {
    private readonly _mongodb: IMongoGateway;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway
    ) {
        this._mongodb = mongodb;
    }


    public authorization(): Observable<boolean> {
        const dbName: string = "admin";
        const collectionName: string = "prueba";
        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findFistDocument(
                    dbName,
                    collectionName,
                    {
                        userName: "",
                        password: ""
                    } as unknown as Filter<Document>
                )
            ),
            map((user: Document | null) => {
                return user !== null ? true : false;
            })
        );
    }

    public test(): Observable<Object> {
        const dbName: string = "admin";
        const collectionName: string = "prueba";
        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findAllDocuments(dbName, collectionName)
            ),
            map((documents: Document[]) => ({
                total: documents.length,
                records: documents
            }))
        );
    }
}