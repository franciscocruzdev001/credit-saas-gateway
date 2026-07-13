import { map, mergeMap, Observable, of } from "rxjs";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document } from 'mongodb';

@injectable()
export class AuthorizerService implements IAuthorizerService {
    private readonly _mongodb: IMongoGateway;
    

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway
    ) {
        this._mongodb = mongodb;
    }


    public authorization(): Observable<boolean> {
        return of(1).pipe(
            map(() => true)
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