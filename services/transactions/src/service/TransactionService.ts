import { map, mergeMap, Observable, of } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { Document, Filter } from 'mongodb';
import { TYPES } from "../constant/types";
import { ITransactionService } from "../repository/ITransactionService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import { FiltersItems as FilterItemsTransactions, SearchTransactionsRequest } from "../types/SearchTransactionsRequest"
import { FiltersItems as FilterItemsTransactionsByUser, SearchTransactionsByUserRequest } from "../types/SearchTransactionsByUserRequest"
import { TransactionMongoModel } from "../gateway/TransactionMongoModel";
import { QueryOptions, Types } from "mongoose";
import { ITransactions } from "../schema/mongodb/models/TransactionsModel";
import { QueryFilter } from "mongoose";

@injectable()
export class TransactionService implements ITransactionService {
    private readonly _mongodb: IMongoGateway;
    private readonly _transactionMongoModel: TransactionMongoModel;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.TransactionMongoModel) transactionMongoModel: TransactionMongoModel,

    ) {
        this._mongodb = mongodb;
        this._transactionMongoModel = transactionMongoModel;
    }

    public searchTransactions(
        searchTransactionData: SearchTransactionsRequest
    ): Observable<Object> {
        const salto = (get(searchTransactionData, "pagination.pageNumber", 1)) * get(searchTransactionData, "pagination.limit", 0);
        console.log("searchCredits-searchTransactionData: ", searchTransactionData);
        console.log("searchCredits-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._searchTransactions(
                    this._buildSearchFiltersByTransactions(searchTransactionData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchTransactionData, "pagination.limit", 0)
                    }
                )
            )
        );
    }

    public searchTransactionsByUser(
        searchTransactionData: SearchTransactionsByUserRequest
    ): Observable<Object> {
        const salto = (get(searchTransactionData, "pagination.pageNumber", 1)) * get(searchTransactionData, "pagination.limit", 0);
        console.log("searchCredits-searchTransactionData: ", searchTransactionData);
        console.log("searchCredits-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._searchTransactions(
                    this._buildSearchFiltersByTransactionsToUser(searchTransactionData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchTransactionData, "pagination.limit", 0)
                    }
                )
            )
        );
    }

    private _searchTransactions(queryFilter: QueryFilter<ITransactions>, options: QueryOptions): Observable<Object> {
        return of(1).pipe(
            mergeMap(() =>
                this._transactionMongoModel.findDocuments(
                    queryFilter,
                    options
                )
            ),
            map((dataResponse: { documents: Document[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }

    private _buildSearchFiltersByTransactions(filters: FilterItemsTransactions): QueryFilter<ITransactions> {
        console.log("buildSearchFiltersByTransactions-filters:", filters);
        return {
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "")),
            ...omitBy({
                status: isEmpty(get(filters, "status", []))
                    ? undefined
                    : {
                        $in: get(filters, "status", [])
                    }
            }, (value: any) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            })
        }
    }

    private _buildSearchFiltersByTransactionsToUser(filters: FilterItemsTransactionsByUser): QueryFilter<ITransactions> {
        console.log("_buildSearchFiltersByTransactionsToUser-filters:", filters);
        return {
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "")),
            sourceAccount: {
                walletId: new Types.ObjectId(get(filters, "walletId", "")),
                accountNumber: get(filters, "accountNumber", "")
            },
            destinationAcount: {
                walletId: new Types.ObjectId(get(filters, "walletId", "")),
                accountNumber: get(filters, "accountNumber", "")
            },
            ...omitBy({},
                (value: any) => {
                    return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
                })
        }
    }
}


