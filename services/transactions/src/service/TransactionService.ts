import { map, mergeMap, Observable, of } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { Document, Filter } from 'mongodb';
import { TYPES } from "../constant/types";
import { ITransactionService } from "../repository/ITransactionService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import{FiltersItems as FilterItemsTransactions, SearchTransactionsRequest} from "../types/SearchTransactionsRequest"

@injectable()
export class TransactionService implements ITransactionService {
    private readonly _mongodb: IMongoGateway;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway
    ) {
        this._mongodb = mongodb;
    }

   public searchTransactions(
        searchTransactionData: SearchTransactionsRequest
    ): Observable<Object> {

        const dbName: string = "admin";
        const salto = (get(searchTransactionData, "pagination.pageNumber", 1)) * get(searchTransactionData, "pagination.limit", 0)

        console.log("searchCredits-searchTransactionData: ", searchTransactionData);
        console.log("searchCredits-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findDocuments(dbName, CollectionNameEnum.TRANSACTION_TEST,
                    this._buildSearchFiltersByTransactions(searchTransactionData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchTransactionData, "pagination.limit", 0)
                    }
                )
            ),
            map((dataResponse: { documents: Document[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }



    private _buildSearchFiltersByTransactions(filters: FilterItemsTransactions): Filter<Document> {
        console.log("buildSearchFiltersByTransactions-filters:", filters);
        const queryFilter = {
            //status: get(searchCreditsData, "status", undefined),
            status: isEmpty(get(filters, "status", [])) ? undefined : {
                $in: get(filters, "status", []),
            },
            creditorCompanyId: get(filters, "creditorCompanyId", undefined)
        }
        console.log("buildSearchFiltersByTransactions-queryFilter:", queryFilter);
        return omitBy(queryFilter,
            (value: any) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value)) || value === "";
            }
        )

    }
}


