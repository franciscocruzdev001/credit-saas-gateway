import { forkJoin, from, iif, map, mergeMap, Observable, of, reduce } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { ITransactionService } from "../repository/ITransactionService";
import { defaultTo, get, isEmpty, isEqual, isNil, isObject, isUndefined, omitBy } from "lodash";
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
import { TRANSACTION_APPROVED_OPERATION_WALLET_BUILD, TRANSACTION_EFFECTS, TRANSACTION_PENDING_OPERATION_WALLET_BUILD, UpdateOperation } from "../infrastructure/catologs/TrasactionEffectsCatalog";
import { IWallets } from "../schema/mongodb/models/Wallets.Model";
import { WalletsMongoModel } from "../gateway/WalletsMongoModel";
import { AuthorizationContext } from "../types/AuthorizationContext";
import { CurrencyEnum } from "../infrastructure/CurrencyEnum";
import { ENTITY_OPERATION_BUID_UPDATE, EntityUpdateResult, UpdateQueryFiltersByEntity } from "../infrastructure/catologs/EntityOperationBuildUpdate";
import { CreditMongoModel } from "../gateway/CreditMongoModel";
import { PaymentsMongoModel } from "../gateway/PaymentsMongoModel";
import { TransactionBasicApproveInfo } from "../types/TransactionBasicApproveInfo";
import { ResumeTotalsByTransactionType, TransactionChangeStatusBatchLogs } from "../types/TransactionChangeStatusBatchLogs";
import { TransactionChangeStatusBatchLogsMongoModel } from "../gateway/TransactionChangeStatusBatchLogsMongoModel";
import { TransactionChangeStatusBatchModel } from "../schema/mongodb/models/TransactionChangeStatusBatchLogsModel";

@injectable()
export class TransactionService implements ITransactionService {
    private readonly _mongodb: IMongoGateway;
    private readonly _transactionMongoModel: TransactionMongoModel;
    private readonly _walletsMongoModel: WalletsMongoModel;
    private readonly _creditMongoModel: CreditMongoModel;
    private readonly _paymentsMongoModel: PaymentsMongoModel;
    private readonly _transactionChangeStatusBatchLogsMongoModel: TransactionChangeStatusBatchLogsMongoModel;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.TransactionMongoModel) transactionMongoModel: TransactionMongoModel,
        @inject(TYPES.WalletsMongoModel) walletsMongoModel: WalletsMongoModel,
        @inject(TYPES.CreditMongoModel) creditMongoModel: CreditMongoModel,
        @inject(TYPES.PaymentsMongoModel) paymentsMongoModel: PaymentsMongoModel,
        @inject(TYPES.TransactionChangeStatusBatchLogsMongoModel) transactionChangeStatusBatchLogsMongoModel: TransactionChangeStatusBatchLogsMongoModel
    ) {
        this._mongodb = mongodb;
        this._transactionMongoModel = transactionMongoModel;
        this._walletsMongoModel = walletsMongoModel;
        this._creditMongoModel = creditMongoModel;
        this._paymentsMongoModel = paymentsMongoModel;
        this._transactionChangeStatusBatchLogsMongoModel = transactionChangeStatusBatchLogsMongoModel;
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
        transactionData: CreateTransactionByEmployeeRequest,
        authorizationContext: AuthorizationContext
    ): Observable<boolean> {
        const creditorCompanyId: string = get(authorizationContext, "creditorCompanyId", "");
        const userId: string = get(authorizationContext, "userId", "");
        const userWalletId: string = get(authorizationContext, "walletId", "");
        const userAccountNumber: string = get(authorizationContext, "accountNumber", "");
        const destinationWalletId = get(transactionData, "destinationAccount.walletId", "");

        return this._processNewTrasaction(
            get(transactionData, "transactionType", "") as TransactionTypeEnum,
            // source account: siempre la wallet del empleado autenticado (JWT) // Aca debes verificar el tipo de movimiento, si no aplica la cuenta de origen no se debe de mandar
            {
                userId: userId,
                walletId: userWalletId,
                accountNumber: userAccountNumber
            },
            // destination account: la que venga en la solicitud (si aplica, ej. retiro no manda)
            !isEmpty(destinationWalletId) ? {
                accountNumber: get(transactionData, "destinationAccount.accountNumber", ""),
                walletId: destinationWalletId
            } : undefined,
            {
                amountTransaction: get(transactionData, "total", 0),
                currency: get(transactionData, "currency", ""),
                descripcion: get(transactionData, "description", ""),
                creditorCompanyId: creditorCompanyId
            }
        ).pipe(
            map((transactionResult: { approveOperation: boolean, transactionId: string }) =>
                transactionResult.approveOperation && !isEmpty(transactionResult.transactionId)
            )
        );
    }

    public approveTransactionsOperations(
        transactionIds: string[],
        authorizationContext: AuthorizationContext
    ): Observable<TransactionChangeStatusBatchLogs> {
        return from(transactionIds).pipe(
            mergeMap((transactionId: string) =>
                //Consultar la informacion de las wallets en la transaccion (Origen, Destino) con el id de la transaccion
                this._loadTransactionBasicInformationById(transactionId)

                //Actualizar la transaccion a aprobada

                //actualizar registro ya sea de credito o de pago
            ),
            mergeMap((transactionalOperationInfo: {
                wallets: {
                    sourceAccount: WalletBasicInformation,
                    destinationAccount: WalletBasicInformation
                },
                trasactionBasicApproveInfo: TransactionBasicApproveInfo
            }) => {
                const sourceAccount: WalletBasicInformation = transactionalOperationInfo.wallets.sourceAccount;
                const destinationAccount: WalletBasicInformation = transactionalOperationInfo.wallets.destinationAccount;
                //realizar la operacion en las wallets
                return forkJoin([
                    of(transactionalOperationInfo.trasactionBasicApproveInfo),
                    this._processApproveTransaction(
                        //Transaction type - Define operation
                        transactionalOperationInfo.trasactionBasicApproveInfo.transactionType as TransactionTypeEnum,
                        // Source Account info if walletId exist
                        !isEmpty(sourceAccount.walletId) ? {
                            walletId: sourceAccount.walletId,
                            accountNumber: sourceAccount.accountNumber
                        } : undefined,
                        // Destination Account info if walletId exist
                        !isEmpty(destinationAccount.walletId) ? {
                            walletId: destinationAccount.walletId,
                            accountNumber: destinationAccount.accountNumber
                        } : undefined,
                        // Trasaction Basic Approve Info
                        {
                            transactionId: transactionalOperationInfo.trasactionBasicApproveInfo.transactionId,
                            amountTransaction: transactionalOperationInfo.trasactionBasicApproveInfo.amountTransaction,
                            currency: transactionalOperationInfo.trasactionBasicApproveInfo.currency
                        }
                    )
                ])
            }),
            mergeMap((transactionResult: [TransactionBasicApproveInfo, { approveOperation: boolean, transactionId: string }]) =>
                //If transaction operation create, Update credit and payment only when the transactionType is equal to credit or payment
                iif(() => transactionResult[1].approveOperation && !isEmpty(transactionResult[1].transactionId),
                    //if transaction approve operation is true, Update credit and payment only when the transactionType is equal to credit or payment
                    //{ code here}
                    forkJoin([
                        of(transactionResult[0]),
                        this._processUpdateEntityByTransactionType(transactionResult[0]),
                    ]),
                    //else transaction approve operation is false
                    forkJoin([
                        of(transactionResult[0]),
                        of(false)
                    ])
                )
            ),
            // Acumular todas las respuestas
            reduce((report: TransactionChangeStatusBatchLogs, result: [TransactionBasicApproveInfo, boolean]) => {
                const resumeTotals: ResumeTotalsByTransactionType | undefined = report.resumeTotalsByTransactionType.find(
                    (resume: ResumeTotalsByTransactionType) => isEqual(resume.transactionType, result[0].transactionType)
                );

                if (!isUndefined(resumeTotals)) {
                    if (result[1]) {
                        resumeTotals.totalChangeStatusApproved += result[0].amountTransaction,
                            resumeTotals.transactionsChangeStatusApproved.push({
                                transactionId: result[0].transactionId,
                                amountTransaction: result[0].amountTransaction
                            });
                    } else {
                        resumeTotals.totalChangeStatusRejected += result[0].amountTransaction,
                            resumeTotals.transactionsChangeStatusRejected.push({
                                transactionId: result[0].transactionId,
                                amountTransaction: result[0].amountTransaction
                            });
                    }
                } else {
                    report.resumeTotalsByTransactionType.push({
                        transactionType: result[0].transactionType,
                        ...result[1] ? {
                            totalChangeStatusRejected: 0,
                            transactionsChangeStatusRejected: [],
                            totalChangeStatusApproved: result[0].amountTransaction,
                            transactionsChangeStatusApproved: [{ transactionId: result[0].transactionId, amountTransaction: result[0].amountTransaction }]
                        } : {
                            totalChangeStatusApproved: 0,
                            transactionsChangeStatusApproved: [],
                            totalChangeStatusRejected: result[0].amountTransaction,
                            transactionsChangeStatusRejected: [{ transactionId: result[0].transactionId, amountTransaction: result[0].amountTransaction }]
                        }
                    });
                }

                return report;
            },
                {
                    changeStatus: TransactionStatusEnum.APPROVED,
                    resumeTotalsByTransactionType: []
                }
            ),
            mergeMap((report: TransactionChangeStatusBatchLogs) =>
                forkJoin([
                    of(report),
                    this._transactionChangeStatusBatchLogsMongoModel.create(new TransactionChangeStatusBatchModel({
                        changeStatus: report.changeStatus as TransactionStatusEnum,
                        resumeTotalsByTransactionType: report.resumeTotalsByTransactionType.map(item => ({
                            ...item,
                            transactionType: item.transactionType as TransactionTypeEnum,
                            transactionsChangeStatusApproved: [
                                ...item.transactionsChangeStatusApproved
                            ],
                            transactionsChangeStatusRejected: [
                                ...item.transactionsChangeStatusRejected
                            ]
                        }))
                    }))
                ])
            ),
            map((resultReport: [TransactionChangeStatusBatchLogs, string]) => ({
                ...resultReport[0],
                transactionChangeStatusBatchLogsId: resultReport[1]
            }))
        );
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
                            } : {}
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

    private _loadTransactionBasicInformationById(transactionId: string): Observable<{
        wallets: {
            sourceAccount: WalletBasicInformation,
            destinationAccount: WalletBasicInformation
        },
        trasactionBasicApproveInfo: TransactionBasicApproveInfo
    }> {
        return of(1).pipe(
            mergeMap(() =>
                //Consultar la informacion de las wallets en la transaccion (Origen, Destino) con el id de la transaccion
                this._transactionMongoModel.findByIdDocument(transactionId)
            ),
            map((transaction: ITransactions | null) => {
                const transactionValue: ITransactions | {} = defaultTo(transaction, {});
                const objectTransactionId: Types.ObjectId | undefined = get(transactionValue, "_id", undefined);
                const sourceAccountObjectWalletId: Types.ObjectId | undefined = get(transactionValue, "sourceAccount.walletId", undefined);
                const destinationAccountObjectWalletId: Types.ObjectId | undefined = get(transactionValue, "destinationAccount.walletId", undefined);
                const ObjectCreditIdSource: Types.ObjectId | undefined = get(transactionValue, "creditIdSource", undefined);

                return {
                    wallets: {
                        sourceAccount: {
                            walletId: !isUndefined(sourceAccountObjectWalletId) ? sourceAccountObjectWalletId.toString() : "",
                            accountNumber: get(transactionValue, "sourceAccount.accountNumber", "")
                        },
                        destinationAccount: {
                            walletId: !isUndefined(destinationAccountObjectWalletId) ? destinationAccountObjectWalletId.toString() : "",
                            accountNumber: get(transactionValue, "destinationAccount.accountNumber", "")
                        }
                    },
                    trasactionBasicApproveInfo: {
                        transactionId: !isUndefined(objectTransactionId) ? objectTransactionId.toString() : "",
                        transactionType: get(transactionValue, "transactionType", TransactionTypeEnum.DEPOSIT),
                        amountTransaction: get(transactionValue, "total", 0),
                        currency: get(transactionValue, "currency", CurrencyEnum.MXN),
                        ...!isUndefined(ObjectCreditIdSource) ? {
                            creditIdSource: ObjectCreditIdSource.toString()
                        } : {}
                    }
                }
            })
        );
    }

    private _processApproveTransaction(
        transactionType: TransactionTypeEnum,
        sourceAccount: WalletBasicInformation | undefined,
        destinationAccount: WalletBasicInformation | undefined,
        trasactionBasicApproveInfo: {
            transactionId: string,
            amountTransaction: number,
            currency: string
        }
    ): Observable<{
        approveOperation: boolean,
        transactionId: string
    }> {
        const transactionId: string = trasactionBasicApproveInfo.transactionId;
        const amountTransaction: number = trasactionBasicApproveInfo.amountTransaction;
        const transactionEffects: {
            sourceAccount: UpdateOperation,
            destinationAccount: UpdateOperation
        } = TRANSACTION_EFFECTS[transactionType];
        return of(1).pipe(
            mergeMap(() => {
                const transactionOperationSourceAccount: {
                    queryfilter: QueryFilter<IWallets>,
                    updateQuery: UpdateQuery<IWallets>
                } = TRANSACTION_APPROVED_OPERATION_WALLET_BUILD[transactionEffects.sourceAccount.operation](
                    get(sourceAccount, "walletId", ""),
                    get(sourceAccount, "accountNumber", ""),
                    amountTransaction
                );
                const transactionOperationDestinationAccount: {
                    queryfilter: QueryFilter<IWallets>,
                    updateQuery: UpdateQuery<IWallets>
                } = TRANSACTION_APPROVED_OPERATION_WALLET_BUILD[transactionEffects.destinationAccount.operation](
                    get(destinationAccount, "walletId", ""),
                    get(destinationAccount, "accountNumber", ""),
                    amountTransaction
                );

                return forkJoin({
                    // SourceAccount: Expenses movements (CREDIT, WITHDRAWAL, TRANSFER-OUT ) - pendingExpensesBalance
                    sourceAccountWalletCheckUpdate: transactionEffects.sourceAccount.update ?
                        this._walletsMongoModel.updateOne(transactionOperationSourceAccount.queryfilter, transactionOperationSourceAccount.updateQuery) : of(false),
                    // DestinationAccount: Income movements (DEPOSIT, PAYMENT, TRANSFER-IN ) - pendingIncomesBalance
                    destinationAccountWalletCheckUpdate: transactionEffects.destinationAccount.update ?
                        this._walletsMongoModel.updateOne(transactionOperationDestinationAccount.queryfilter, transactionOperationDestinationAccount.updateQuery) : of(false),
                })
            }),
            map((walletsProcessOperation: { sourceAccountWalletCheckUpdate: boolean, destinationAccountWalletCheckUpdate: boolean }) =>
                this._checkValidUpdateWalletsByTransactionEffects(walletsProcessOperation, transactionEffects)
            ),
            mergeMap((resultWalletsApprovedOperation: boolean) =>
                //Validate if update firm balance on wallet
                iif(() => resultWalletsApprovedOperation,
                    //if pending balance on wallet update, update transaction status
                    forkJoin({
                        approveOperation: this._transactionMongoModel.updateOne(
                            { _id: transactionId }, // query filter
                            { status: TransactionStatusEnum.APPROVED } // update query
                        ),
                        transactionId: transactionId
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

    private _processUpdateEntityByTransactionType(trasactionBasicApproveInfo: TransactionBasicApproveInfo): Observable<boolean> {
        //Si no existe mapeo, eso indica que no se requiere actualizar ninguna entidad
        if (!ENTITY_OPERATION_BUID_UPDATE[trasactionBasicApproveInfo.transactionType]) return of(true)

        const entityOperationBuild: UpdateQueryFiltersByEntity = defaultTo(
            ENTITY_OPERATION_BUID_UPDATE[trasactionBasicApproveInfo.transactionType],
            (amountTransaction: number) => ({})
        )(trasactionBasicApproveInfo.amountTransaction);

        return of(1).pipe(
            mergeMap(() =>
                forkJoin({
                    paymentsQuery:
                        entityOperationBuild.paymentsQuery ?
                            this._paymentsMongoModel.updateOne({ transactionId: trasactionBasicApproveInfo.transactionId }, entityOperationBuild.paymentsQuery) :
                            of(false),
                    creditsQuery:
                        entityOperationBuild.creditsQuery ?
                            this._creditMongoModel.updateOne({
                                ...trasactionBasicApproveInfo.creditIdSource ? {
                                    _id: trasactionBasicApproveInfo.creditIdSource
                                } : {
                                    transactionId: trasactionBasicApproveInfo.transactionId
                                }
                            },
                                entityOperationBuild.creditsQuery,
                                Array.isArray(entityOperationBuild.creditsQuery)
                                    ? { updatePipeline: true }
                                    : undefined
                            )
                            : of(false)
                })
            ),
            map((updatesEntitiesModel: EntityUpdateResult) => (
                this._checkValidUpdateEntitiesByOperationBuild(
                    updatesEntitiesModel,
                    entityOperationBuild
                )
            )),
        );
    }

    private _checkValidUpdateEntitiesByOperationBuild(
        updatesEntitiesModel: EntityUpdateResult,
        entityOperationBuild: UpdateQueryFiltersByEntity
    ): boolean {
        const expectedEntities = Object.keys(entityOperationBuild);

        return expectedEntities.every(
            entity => updatesEntitiesModel[entity as keyof UpdateQueryFiltersByEntity] === true
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
        const startDateCreated: number | undefined = get( filters, "createdRangeDate.startDate", undefined );
        const endDateCreated: number | undefined = get(filters, "createdRangeDate.endDate", undefined);
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
                createdAt: (!isNil(startDateCreated) || !isNil(endDateCreated)) ? {
                    $gte: !isNil(startDateCreated)? new Date(startDateCreated) : undefined,
                    $lte: !isNil(endDateCreated) ? new Date(endDateCreated) : undefined,
                } : {}
            }, (value: any) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            })
        }
    }
}