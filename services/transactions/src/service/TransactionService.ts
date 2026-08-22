import { forkJoin, iif, map, mergeMap, Observable, of } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { Document, Filter } from 'mongodb';
import { TYPES } from "../constant/types";
import { ITransactionService } from "../repository/ITransactionService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { get, isEmpty, isEqual, isNil, isObject, isUndefined, omitBy } from "lodash";
import { FiltersItems as FilterItemsTransactions, SearchTransactionsRequest } from "../types/SearchTransactionsRequest"
import { FiltersItems as FilterItemsTransactionsByUser, SearchTransactionsByUserRequest } from "../types/SearchTransactionsByUserRequest"
import { CreateTransactionByEmployeeRequest } from "../types/CreateTransactionByEmployeeRequest";
import { TransactionMongoModel } from "../gateway/TransactionMongoModel";
import { QueryOptions, Types, UpdateQuery } from "mongoose";
import { ITransactions } from "../schema/mongodb/models/TransactionsModel";
import { QueryFilter } from "mongoose";
import { TransactionStatusEnum } from "../infrastructure/TransactionStatusEnum";
import { TransactionTypeEnum } from "../infrastructure/TransactionTypeEnum";
import { WalletBasicInformation } from "../types/WalletBasicInformation";
import { TRANSACTION_EFFECTS, TRANSACTION_PENDING_OPERATION_WALLET_BUILD, UpdateOperation } from "../infrastructure/catologs/TrasactionEffectsCatalog";
import { IWallets } from "../schema/mongodb/models/Wallets.Model";
import { WalletsMongoModel } from "../gateway/WalletsMongoModel";

@injectable()
export class TransactionService implements ITransactionService {
    private readonly _mongodb: IMongoGateway;
    private readonly _transactionMongoModel: TransactionMongoModel;
    private readonly _walletsMongoModel: WalletsMongoModel;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.TransactionMongoModel) transactionMongoModel: TransactionMongoModel,
        @inject(TYPES.WalletsMongoModel) walletsMongoModel: WalletsMongoModel
    ) {
        this._mongodb = mongodb;
        this._transactionMongoModel = transactionMongoModel;
        this._walletsMongoModel = walletsMongoModel;
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

    public createTransactionByEmployee(
        transactionData: CreateTransactionByEmployeeRequest
    ): Observable<boolean> {
        const destinationWalletId = get(transactionData, "destinationAccount.walletId", "");

        const transactionModelInfo: Partial<ITransactions> = {
            transactionType: get(transactionData, "transactionType", "") as ITransactions["transactionType"],
            status: TransactionStatusEnum.PENDING,
            total: get(transactionData, "total", 0),
            description: get(transactionData, "description", ""),
            currency: get(transactionData, "currency", ""),
            sourceAccount: {
                accountNumber: get(transactionData, "sourceAccount.accountNumber", ""),
                walletId: new Types.ObjectId(get(transactionData, "sourceAccount.walletId", "")),
            },
            creditorCompanyId: new Types.ObjectId(get(transactionData, "creditorCompanyId", "")),
            ...(!isEmpty(destinationWalletId)
                ? {
                    destinationAccount: {
                        accountNumber: get(transactionData, "destinationAccount.accountNumber", ""),
                        walletId: new Types.ObjectId(destinationWalletId),
                    },
                }
                : {}),
            ...(get(transactionData, "creditIdSource")
                ? { creditIdSource: new Types.ObjectId(get(transactionData, "creditIdSource", "")) }
                : {}),
        };

        return of(true);
        //return of(1).pipe(mergeMap(() => this._transactionMongoModel.create(transactionModelInfo)));
    }

    private _processNewTrasaction(
        transactionType: TransactionTypeEnum,
        sourceAccount: WalletBasicInformation | undefined,
        destinationAccount: WalletBasicInformation | undefined,
        transacionBasicInformation: {
            amountTransaction: number,
            currency: string,
            descripcion: string,
            creditorCompanyId: string
        }
    ): Observable<{
        approveOperation: boolean,
        transactionId: string
    }> {
        const amountTransaction: number = transacionBasicInformation.amountTransaction;
        const transactionEffects: {
            sourceAccount: UpdateOperation,
            destinationAccount: UpdateOperation
        } = TRANSACTION_EFFECTS[transactionType];
        /*
            CREDIT: ACTUALIZA WALLET DE ORIGEN y WALLET DESTINO
            WITHDRAWAL: ACTUALIZA SOLO LA WALLET DE ORIGEN
            TRANSFER: ACTUALIZA LA WALLET DE ORIGEN Y LA WALLET DESTINO
            DEPOSIT: ACTUALIZA LA WALLET DESTINO
            PAYMENT: ACTUALIZA LA WALLET DESTINO, ACA IGNORA ACTUALIZAR LA WALLET ORIGEN PUESTO QUE ES UN INGRESO EN EFECTIVO
         */

        return of(true).pipe(
            // Income movements pendingIncomesBalance - Expenses movements pendingExpensesBalance
            mergeMap(() => {
                const transactionOperationSourceAccount: {
                    queryfilter: QueryFilter<IWallets>,
                    updateQuery: UpdateQuery<IWallets>
                } = TRANSACTION_PENDING_OPERATION_WALLET_BUILD[transactionEffects.sourceAccount.operation](
                    get(sourceAccount, "walletId", ""),
                    get(sourceAccount, "accountNumber", ""),
                    amountTransaction
                );
                const transactionOperationDestinationAccount: {
                    queryfilter: QueryFilter<IWallets>,
                    updateQuery: UpdateQuery<IWallets>
                } = TRANSACTION_PENDING_OPERATION_WALLET_BUILD[transactionEffects.destinationAccount.operation](
                    get(destinationAccount, "walletId", ""),
                    get(destinationAccount, "accountNumber", ""),
                    amountTransaction
                );

                return forkJoin({
                    // SourceAccount: Expenses movements (CREDIT, WITHDRAWAL, TRANSFER-OUT ) - pendingIncomesBalance
                    sourceAccountWalletCheckUpdate: transactionEffects.sourceAccount.update ?
                        this._walletsMongoModel.updateOne(transactionOperationSourceAccount.queryfilter, transactionOperationSourceAccount.updateQuery) : of(false),
                    // DestinationAccount: Income movements (DEPOSIT, PAYMENT, TRANSFER-IN ) - pendingIncomesBalance
                    destinationAccountWalletCheckUpdate: transactionEffects.destinationAccount.update ?
                        this._walletsMongoModel.updateOne(transactionOperationDestinationAccount.queryfilter, transactionOperationDestinationAccount.updateQuery) : of(false),
                })
            }),
            map((walletsProcessOperation: { sourceAccountWalletCheckUpdate: boolean, destinationAccountWalletCheckUpdate: boolean }) =>
                // Expenses movements (DEPOSIT, PAYMENT, TRANSFER-IN ) - pendingIncomesBalance
                this._checkValidUpdateWalletsByTransactionEffects(walletsProcessOperation, transactionEffects)
            ),
            mergeMap((resultWalletsApprovedOperation: boolean) =>
                //Validate if update pending balance on wallet
                iif(() => resultWalletsApprovedOperation,
                    //if pending balance on wallet update, create transaction
                    forkJoin({
                        approveOperation: of(resultWalletsApprovedOperation),
                        transactionId: this._transactionMongoModel.create({
                            transactionType: transactionType,
                            status: TransactionStatusEnum.PENDING,
                            total: amountTransaction,
                            description: transacionBasicInformation.descripcion,
                            currency: transacionBasicInformation.currency,
                            creditorCompanyId: new Types.ObjectId(transacionBasicInformation.creditorCompanyId),
                            ...!isUndefined(sourceAccount) ? {
                                sourceAccount: {
                                    walletId: new Types.ObjectId(sourceAccount.walletId),
                                    accountNumber: sourceAccount.accountNumber
                                }
                            } : {},
                            ...!isUndefined(destinationAccount) ? {
                                destinationAccount: {
                                    walletId: new Types.ObjectId(destinationAccount.walletId),
                                    accountNumber: destinationAccount.accountNumber
                                }
                            }: {}
                        })
                    }),
                    //else pending balance on wallet not update, get false and empty transactionId
                    of({
                        approveOperation: resultWalletsApprovedOperation,
                        transactionId: ""
                    })
                )
            )
        );
    }

    private _checkValidUpdateWalletsByTransactionEffects(
        walletsProcessOperation: {
            sourceAccountWalletCheckUpdate: boolean,
            destinationAccountWalletCheckUpdate: boolean
        },
        transactionEffects: {
            sourceAccount: UpdateOperation,
            destinationAccount: UpdateOperation
        }
    ): boolean {
        return isEqual(walletsProcessOperation.sourceAccountWalletCheckUpdate, transactionEffects.sourceAccount.update) &&
            isEqual(walletsProcessOperation.destinationAccountWalletCheckUpdate, transactionEffects.destinationAccount.update) ? true : false;
    }

    private _searchTransactions(queryFilter: QueryFilter<ITransactions>, options: QueryOptions): Observable<Object> {
        return of(1).pipe(
            mergeMap(() =>
                this._transactionMongoModel.findDocuments(
                    queryFilter,
                    options
                )
            ),
            map((dataResponse: { documents: ITransactions[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }

    private _buildSearchFiltersByTransactions(filters: FilterItemsTransactions): QueryFilter<ITransactions> {
        console.log("buildSearchFiltersByTransactions-filters:", filters);
        const walletId = get(filters, "accountInformacion.walletId", "");
        const accountNumber = get(filters, "accountInformacion.accountNumber", "");
        const startDateCreated: string = get(filters, "createdRangeDate.startDate", "");
        const endDateCreated: string = get(filters, "createdRangeDate.endDate", "");
        const generalSearch: string = get(filters, "generalSearch", "");
        return {
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "")),
            ...omitBy({
                status: isEmpty(get(filters, "status", []))
                    ? undefined
                    : {
                        $in: get(filters, "status", [])
                    },
                transactionType: isEmpty(get(filters, "transactionType", []))
                    ? undefined
                    : {
                        $in: get(filters, "transactionType", [])
                    },
                createdAt: (!isEmpty(startDateCreated) || !isEmpty(endDateCreated)) ? {
                    $gte: !isEmpty(startDateCreated) ? new Date(startDateCreated) : undefined,
                    $lte: !isEmpty(endDateCreated) ? new Date(endDateCreated) : undefined,
                } : {},
                description: !isEmpty(generalSearch) ? { $regex: new RegExp(generalSearch, 'i') } : undefined,
                $or: (!isEmpty(walletId))
                    ? [
                        { "sourceAccount.walletId": new Types.ObjectId(walletId), "sourceAccount.accountNumber": accountNumber },
                        { "destinationAccount.walletId": new Types.ObjectId(walletId), "destinationAccount.accountNumber": accountNumber },
                    ]
                    : undefined,
                /*$and: [
                    {
                        $or: [
                            { }
                        ]                    
                    }
                ]*/
            }, (value: any) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            })
        }
    }

    private _buildSearchFiltersByTransactionsToUser(filters: FilterItemsTransactionsByUser): QueryFilter<ITransactions> {
        console.log("_buildSearchFiltersByTransactionsToUser-filters:", filters);
        const walletId = new Types.ObjectId(get(filters, "accountInformacion.walletId", ""));
        const accountNumber = get(filters, "accountInformacion.accountNumber", "");
        const startDateCreated: string = get(filters, "createdRangeDate.startDate", "");
        const endDateCreated: string = get(filters, "createdRangeDate.endDate", "");
        const generalSearch: string = get(filters, "generalSearch", "");

        return {
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "")),
            status: { $in: [TransactionStatusEnum.PENDING, TransactionStatusEnum.APPROVED] },
            $or: [
                { "sourceAccount.walletId": walletId, "sourceAccount.accountNumber": accountNumber },
                { "destinationAccount.walletId": walletId, "destinationAccount.accountNumber": accountNumber },
            ],
            ...omitBy({
                description: !isEmpty(generalSearch) ? { $regex: new RegExp(generalSearch, 'i') } : undefined,
                transactionType: isEmpty(get(filters, "transactionType", []))
                    ? undefined
                    : {
                        $in: get(filters, "transactionType", [])
                    },
                createdAt: (!isEmpty(startDateCreated) || !isEmpty(endDateCreated)) ? {
                    $gte: !isEmpty(startDateCreated) ? new Date(startDateCreated) : undefined,
                    $lte: !isEmpty(endDateCreated) ? new Date(endDateCreated) : undefined,
                } : {}
            }, (value: any) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            })
        }
    }
}