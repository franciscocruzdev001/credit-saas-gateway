import { map, mergeMap, Observable, of } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document, Filter } from 'mongodb';
import { ICreditService } from "../repository/ICreditService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { get, isEmpty, isNil, isObject, isUndefined, omit, omitBy } from "lodash"


@injectable()
export class CreditService implements ICreditService {
    private readonly _mongodb: IMongoGateway;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway
    ) {
        this._mongodb = mongodb;
    }

    public searchCredits(): Observable<Object> {
        const dbName: string = "admin";

        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findAllDocuments(dbName, CollectionNameEnum.PRUEBA)
            ),
            map((documents: Document[]) => ({
                total: documents.length,
                records: documents
            }))
        );
    }

    public searchCustomer(
        searchCustomerData: SearchCustomersRequest
    ): Observable<Object> {

        const dbName: string = "admin";
        const salto = (get(searchCustomerData, "pagination.pageNumber", 1) -1) * get(searchCustomerData, "pagination.limit", 0)

        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findDocuments(dbName, CollectionNameEnum.PRUEBA,
                    this.buildSearchFiltersByCustomers(searchCustomerData), 
                    {
                        skip: salto,
                        limit: get(searchCustomerData, "pagination.limit", 0)
                    }
                )
            ),
            map((documents: Document[]) => ({
                total: documents.length,
                records: documents
            }))
        );
    }


    private buildSearchFiltersByCustomers(searchCustomerData: SearchCustomersRequest): Filter<Document> {
        const queryFilter = {
            //status: get(searchCustomerData, "status", undefined),
            status: { 
                $in: get(searchCustomerData, "status",[]),
            },
            createdByEmployeeId: get(searchCustomerData, "createdByEmployeeId", undefined)

        }
        return omitBy(queryFilter,
            (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value)) || value === "";
            }
        )

    }


   
}