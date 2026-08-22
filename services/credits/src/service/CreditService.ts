import { forkJoin, iif, map, mergeMap, Observable, of, throwError } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document, Filter } from 'mongodb';
import { ICreditService } from "../repository/ICreditService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { FiltersItems as FilterItemsCustomers, SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { defaultTo, filter, get, isEmpty, isEqual, isNil, isObject, isUndefined, omit, omitBy } from "lodash"
import { FiltersItems as FilterItemsCredits, SearchCreditsRequest } from "../types/SearchCreditsRequest"
import { CreditMongoModel } from "../gateway/CreditMongoModel";
import { QueryOptions, Types } from "mongoose";
import { ICredits } from "../schema/mongodb/models/CreditsModel";
import { CustomersMongoModel } from "../gateway/CutomersMongoModel";
import { QueryFilter } from "mongoose";
import { UserRoleEnum } from "../infrastructure/UserRoleEnum";
import { UserRoleEmployeeCatalog } from "../infrastructure/catalogs/UserRoleCatalogs";
import { SearchCreditsByEmployeeRequest } from "../types/SearchCreditsByEmployeeRequest";
import { ICustomers } from "../schema/mongodb/models/Customers.Model";
import { PaymentsMongoModel } from "../gateway/PaymentsMongoModel";
import { IPayments } from "../schema/mongodb/models/Payments.Model";
import { GetPaymentRequest } from "../types/GetPaymentRequest";
import { WalletsMongoModel } from "../gateway/WalletsMongoModel";
import { IWallets } from "../schema/mongodb/models/Wallets.Model";
import { GetWalletRequest } from "../types/GetWalletRequest";
import { TransactionStatusEnum } from "../infrastructure/TransactionStatusEnum";
import { Customers } from "../types/Customers";
import { Credits } from "../types/Credits";
import { TransactionTypeEnum } from "../infrastructure/TransactionTypeEnum";
import { WalletBasicInformation } from "../types/WalletBasicInformation";
import { CurrencyEnum } from "../infrastructure/CurrencyEnum";
import { CustomerStatusEnum } from "../infrastructure/CustomerStatusEnum";
import { TransactionMongoModel } from "../gateway/TransactionMongoModel";
import { TRANSACTION_EFFECTS, TRANSACTION_PENDING_OPERATION_WALLET_BUILD, UpdateOperation } from "../infrastructure/catalogs/TrasactionEffectsCatalog";
import { UpdateQuery } from "mongoose";
import { generateAcccountNumberWallet } from "../infrastructure/utils/ProcessDataCreditsUtils";
import { WalletStatusEnum } from "../infrastructure/WalletStatusEnum";
import { CreditStatusEnum } from "../infrastructure/CreditStatusEnum";
import { chargeFrequencyEnum } from "../infrastructure/ChargeFrequencyEnum";


@injectable()
export class CreditService implements ICreditService {
    private readonly _mongodb: IMongoGateway;
    private readonly _creditMongoModel: CreditMongoModel;
    private readonly _customerMongoModel: CustomersMongoModel;
    private readonly _paymentsMongoModel: PaymentsMongoModel;
    private readonly _walletsMongoModel: WalletsMongoModel;
    private readonly _transactionsMongoModel: TransactionMongoModel;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.CreditMongoModel) creditMongoModel: CreditMongoModel,
        @inject(TYPES.CustomersMongoModel) customersMongoModel: CustomersMongoModel,
        @inject(TYPES.PaymentsMongoModel) paymentsMongoModel: PaymentsMongoModel,
        @inject(TYPES.WalletsMongoModel) walletsMongoModel: WalletsMongoModel,
        @inject(TYPES.TransactionMongoModel) transactionsMongoModel: TransactionMongoModel,
    ) {
        this._mongodb = mongodb;
        this._creditMongoModel = creditMongoModel;
        this._customerMongoModel = customersMongoModel;
        this._paymentsMongoModel = paymentsMongoModel;
        this._walletsMongoModel = walletsMongoModel;
        this._transactionsMongoModel = transactionsMongoModel;
    }


    public createCreditsByEmployee(
        creditCustomer: {
            customer?: Customers,
            credit: Credits
        }
    ): Observable<boolean> {
        const customer: Customers | undefined = get(creditCustomer, "customer", undefined);
        const creditorCompanyId: string = ""; // Recuperar del JWT
        const userId: string = ""; //Recuperar del JWT
        const userWalletId: string = ""; //Recuperar del JWT
        const userAccountNumber: string = ""; //Recuperar del JWT

        return of(true).pipe(
            mergeMap(() =>
                //Validate if customer form contain info
                iif(() => !isUndefined(customer),
                    //if customer form contain info, create customer withou wallet
                    this._processNewCustomer(customer as Customers),
                    //else customer form empty, get wallet info from customerId on credits form
                    this._loadWalletInfo(CollectionNameEnum.CUSTOMERS, { customerId: get(creditCustomer.credit, "customerId", "") })
                )
            ),
            mergeMap((customerTransactionalInfo: WalletBasicInformation) =>
                //Process transaccion - validate if it can create movement
                forkJoin([
                    of(customerTransactionalInfo),
                    this._processNewTrasaction(
                        // TransactionType - movements
                        TransactionTypeEnum.CREDIT,
                        // source account
                        {
                            userId: userId,
                            walletId: userWalletId,
                            accountNumber: userAccountNumber
                        },
                        //Destination account
                        customerTransactionalInfo,
                        //Transaction information
                        {
                            amountTransaction: get(creditCustomer.credit, "creditAmount", 0),
                            currency: CurrencyEnum.MXN,
                            descripcion: "CREDIT - ", //Agregar el nombre del cliente,
                            creditorCompanyId: creditorCompanyId
                        }
                    )
                ])
            ),
            mergeMap((transactionResult: [WalletBasicInformation, { approveOperation: boolean, transactionId: string }]) =>
                //If transaction operation create, create credit
                iif(() => transactionResult[1].approveOperation && !isEmpty(transactionResult[1].transactionId),
                    //if transaction approve operation is true, create credit
                    this._creditMongoModel.create({
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        creditorCompanyId: new Types.ObjectId(creditorCompanyId),
                        userId: new Types.ObjectId(userId),
                        customerId: new Types.ObjectId(transactionResult[0].customerId),
                        transactionId: new Types.ObjectId(transactionResult[1].transactionId),
                        startDateChargeConfig: new Date(), //Obtener en base al ultimo reporte, es la fecha en la entra el primer pago
                        admissionDate: new Date(),
                        expirationDate: new Date(), // Calcular en base a las reglas de cobro
                        creditAmount: get(creditCustomer.credit, "creditAmount", 0),
                        amountDue: get(creditCustomer.credit, "creditAmount", 0), //Calcular en base a alas reglas de cobro
                        fixedCharge: 300, //Calcular en base a las reglas de cobro
                        creditAmountWithMoratory: get(creditCustomer.credit, "creditAmount", 0), //Actualizar en base a las faltas
                        status: CreditStatusEnum.CHARGE_PROCESS,
                        transactionStatus: TransactionStatusEnum.PENDING,
                        chargeRules: {
                            chargeFrequency: get(creditCustomer, "chargeRules.chargeFrequency", chargeFrequencyEnum.WEEKLY),
                            chargePeriods: get(creditCustomer, "chargeRules.chargePeriods", 1),
                            renovationPeriod: get(creditCustomer, "chargeRules.renovationPeriod", 1),
                            comissionRate: get(creditCustomer, "chargeRules.comissionRate", 1),
                        },
                    }),
                    //else transaction approve operation is true, create credit
                    of("")
                )
            ),
            map((creditId: string) =>
                !isEmpty(creditId) ? true : false 
            )
        );
    }



    public searchCredits(
        searchCreditsData: SearchCreditsRequest
    ): Observable<Object> {
        const salto = (get(searchCreditsData, "pagination.pageNumber", 1)) * get(searchCreditsData, "pagination.limit", 0)

        console.log("searchCredits-searchCreditsData: ", searchCreditsData);
        console.log("searchCredits-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._searchCredits(
                    this._buildSearchFiltersByCredits(searchCreditsData.filtersItems,),
                    {
                        skip: salto,
                        limit: get(searchCreditsData, "pagination.limit", 0)
                    }
                )
            ),
        );
    }

    public searchCreditsByEmployee(
        searchCreditsData: SearchCreditsByEmployeeRequest
    ): Observable<Object> {
        const salto = (get(searchCreditsData, "pagination.pageNumber", 1)) * get(searchCreditsData, "pagination.limit", 0);
        const filtersByRole: {
            creditsFilters: QueryFilter<ICredits>,
            customerFilters: QueryFilter<ICustomers>
        } = UserRoleEmployeeCatalog[UserRoleEnum.MANAGER]!(searchCreditsData.filtersItems);

        console.log("searchCreditsByEmployee-searchCreditsData: ", searchCreditsData);
        console.log("searchCreditsByEmployee-salto: ", salto);
        console.log("searchCreditsByEmployee-filtersByRole: ", filtersByRole);
        return of(1).pipe(
            mergeMap(() =>
                this._creditMongoModel.findCreditsJoinCustomer(
                    filtersByRole.creditsFilters,
                    filtersByRole.customerFilters,
                    {
                        skip: salto,
                        limit: get(searchCreditsData, "pagination.limit", 0)
                    }
                )
            ),
        );
    }

    public searchCustomer(
        searchCustomerData: SearchCustomersRequest
    ): Observable<Object> {

        const dbName: string = "admin";
        const salto = (get(searchCustomerData, "pagination.pageNumber", 1)) * get(searchCustomerData, "pagination.limit", 0)

        console.log("searchCustomer-searchCustomerData: ", searchCustomerData);
        console.log("searchCustomer-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._customerMongoModel.findDocuments(
                    this._buildSearchFiltersByCustomers(searchCustomerData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchCustomerData, "pagination.limit", 0)
                    }
                )
            ),
            map((dataResponse: { documents: Document[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }


    //busca todos los documentos de payments cuyo campo creditId apunte a este crédito
    public getPaymentByCredit(
        request: GetPaymentRequest
    ): Observable<Object> {
        const creditId: string = get(request, "creditId", "");
        const status: string[] = get(request, "status", []);

        console.log("getPaymentHistoryByCredit-request: ", request);

        if (isEmpty(creditId)) {
            return throwError(() => new Error('creditId es requerido'));
        }

        return of(1).pipe(
            mergeMap(() =>
                this._paymentsMongoModel.findDocuments(
                    {
                        creditId: new Types.ObjectId(creditId),
                        // Historial de pagos: por default trae pendientes + aprobados
                        // (antes no filtraba, pero tampoco se podía pedir explícitamente
                        // "solo pendientes" o "solo aprobados" desde el caller)
                        transactionStatus: {
                            $in: !isEmpty(status) ? status : [TransactionStatusEnum.PENDING, TransactionStatusEnum.APPROVED]
                        }
                    } as unknown as QueryFilter<IPayments>
                )
            ),
            map((dataResponse: { documents: IPayments[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }
    //busca el documento de wallets con su  propio _id .
    public getWalletInfo(request: GetWalletRequest): Observable<Object> {
        const walletId: string = get(request, "walletId", "");
        const userId: string = get(request, "userId", "");

        if (isEmpty(walletId) && isEmpty(userId)) {
            return throwError(() => new Error('walletId o userId es requerido'));
        }

        const filter = !isEmpty(walletId)
            ? { _id: new Types.ObjectId(walletId) }
            : { userId: new Types.ObjectId(userId) };

        return of(1).pipe(
            mergeMap(() =>
                this._walletsMongoModel.findDocuments(filter as unknown as QueryFilter<IWallets>)
            ),
            map((dataResponse: { documents: IWallets[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }

    private _processNewTrasaction(
        transactionType: TransactionTypeEnum,
        sourceAccount: WalletBasicInformation,
        destinationAccount: WalletBasicInformation,
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
                } = TRANSACTION_PENDING_OPERATION_WALLET_BUILD[transactionEffects.sourceAccount.operation](sourceAccount.walletId, sourceAccount.accountNumber, amountTransaction);
                const transactionOperationDestinationAccount: {
                    queryfilter: QueryFilter<IWallets>,
                    updateQuery: UpdateQuery<IWallets>
                } = TRANSACTION_PENDING_OPERATION_WALLET_BUILD[transactionEffects.destinationAccount.operation](destinationAccount.walletId, destinationAccount.accountNumber, amountTransaction);

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
                        transactionId: this._transactionsMongoModel.create({
                            transactionType: transactionType,
                            status: TransactionStatusEnum.PENDING,
                            total: amountTransaction,
                            description: transacionBasicInformation.descripcion,
                            currency: transacionBasicInformation.currency,
                            creditorCompanyId: new Types.ObjectId(transacionBasicInformation.creditorCompanyId),
                            sourceAccount: {
                                walletId: new Types.ObjectId(sourceAccount.walletId),
                                accountNumber: sourceAccount.accountNumber
                            },
                            destinationAccount: {
                                walletId: new Types.ObjectId(destinationAccount.walletId),
                                accountNumber: destinationAccount.accountNumber
                            }
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

    private _processNewCustomer(customer: Customers): Observable<WalletBasicInformation> {
        return of(true).pipe(
            mergeMap(() =>
                this._customerMongoModel.create({
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    creditorCompanyId: new Types.ObjectId(customer.creditorCompanyId),
                    userId: new Types.ObjectId(customer.userId),
                    status: CustomerStatusEnum.ACTIVE,
                    threeWordsUbication: customer.threeWordsUbication,
                    contact: customer.contact
                })
            ),
            mergeMap((customerId: string) => {
                const accountNumber: string = generateAcccountNumberWallet(false);
                return iif(() => !isEmpty(customerId),
                    forkJoin({
                        customerId: customerId,
                        walletId: this._walletsMongoModel.create({
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            customerId: new Types.ObjectId(customerId),
                            status: WalletStatusEnum.ACTIVE,
                            accountNumber: accountNumber,
                            firmBalance: 0,
                            pendingIncomesBalance: 0,
                            pendingExpensesBalance: 0
                        }),
                        accountNumber: accountNumber
                    }),
                    of({
                        customerId: "",
                        walletId: "",
                        accountNumber: ""
                    })
                )
            })
        );
    }

    private _loadWalletInfo(entity: CollectionNameEnum, queryfilter: QueryFilter<IWallets>): Observable<WalletBasicInformation> {
        return of(true).pipe(
            mergeMap(() =>
                this._walletsMongoModel.findOneDocument(queryfilter)
            ),
            map((wallet: IWallets | undefined) => {
                const objectIdWalletId: Types.ObjectId | undefined = get(defaultTo(wallet, {}), "_id", undefined);

                return {
                    ...isEqual(entity, CollectionNameEnum.CUSTOMERS) ? {
                        customerId: "" + get(queryfilter, "customerId", "")
                    } : {},
                    ...isEqual(entity, CollectionNameEnum.USERS) ? {
                        userId: "" + get(queryfilter, "userId", "")
                    } : {},
                    walletId: !isUndefined(objectIdWalletId) ? objectIdWalletId.toString() : "",
                    accountNumber: get(defaultTo(wallet, {}), "accountNumber", "")
                }
                /*const objectIdUserId: Types.ObjectId | undefined = get(defaultTo(wallet, {}), "userId", undefined);
                const objectIdCustomerId: Types.ObjectId | undefined = get(defaultTo(wallet, {}), "customerId", undefined);

                return !isUndefined(wallet) ? {
                    userId: !isUndefined(objectIdUserId) ? objectIdUserId.toString() : undefined,
                    customerId: !isUndefined(objectIdCustomerId) ? objectIdCustomerId.toString() : undefined,
                    accountNumber: get(wallet, "accountNumber", ""),
                    status: get(wallet, "status", ""),
                    totalAmount: get(wallet, "totalAmount", 0),
                } as Wallets : {
                    accountNumber: "",
                    status: "",
                    totalAmount: 0
                } as Wallets*/
            })
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

    private _searchCredits(queryFilter: QueryFilter<ICredits>, options?: QueryOptions): Observable<Object> {
        //Validar filtros vacios si no trae ningun filtro rechazar
        return of(1).pipe(
            mergeMap(() =>
                this._creditMongoModel.findDocuments(queryFilter, options)
            ),
            map((dataResponse: { documents: ICredits[], totalDocuments: number }) => {
                console.log("this._creditMongoModel.findDocuments-dataResponse", dataResponse);
                return {
                    total: dataResponse.totalDocuments,
                    records: dataResponse.documents
                }
            })
        );
    }

    private _buildSearchFiltersByCustomers(filters: FilterItemsCustomers): QueryFilter<ICustomers> {
        const queryFilter = {
            //status: get(searchCustomerData, "status", undefined),
            status: isEmpty(get(filters, "status", [])) ? undefined : {
                $in: get(filters, "status", []),
            },
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", ""))
        }
        console.log("buildSearchFiltersByCustomers-queryFilter:", queryFilter);
        return omitBy(queryFilter,
            (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            }
        )
    }

    private _buildSearchFiltersByCredits(filters: FilterItemsCredits): QueryFilter<ICredits> {
        console.log("buildSearchFiltersByCredits-filters:", filters);
        const userId: string = get(filters, "userId", "");
        const customerId: string = get(filters, "customerId", "");
        return {
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", "000000000000000000000000")),
            ...omitBy({
                userId: !isEmpty(userId) ? new Types.ObjectId(userId) : undefined,
                customerId: !isEmpty(customerId) ? new Types.ObjectId(customerId) : undefined,
                status: isEmpty(get(filters, "status", [])) ? undefined : {
                    $in: get(filters, "status", []),
                },
                transactionStatus: isEmpty(get(filters, "transactionStatus", [])) ? undefined : {
                    $in: get(filters, "transactionStatus", []),
                }
            },
                (value) => {
                    return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
                }
            )
        }
    }


    /***
     * quicktype -s schema ./src/schema/search_customers_request.json --just-types --lang ts -o ./src/types/SearchCustomersRequest.ts
     */

    /***
     * quicktype -s schema ./src/schema/search_employees_request.json --just-types --lang ts -o ./src/types/SearchEmployeesRequest.ts
     * quicktype -s schema ./src/schema/search_transactions.request.json --just-types --lang ts -o ./src/types/SearchTransactionsRequest.ts
     * quicktype -s schema ./src/schema/credit_table.json --just-types --lang ts -o ./src/types/CreditTable.ts
     * quicktype -s schema ./src/schema/credit_table.json --just-types --lang ts -o ./src/types/CreditTable.ts
     * quicktype -s schema ./src/schema/get_payment_request.json --just-types --lang ts -o ./src/types/GetPayment.ts
     * 
     * 
     * quicktype -s schema ./src/schema/search_credits_request.json --just-types --lang ts -o ./src/types/SearchCreditsRequest.ts
     * quicktype -s schema ./src/schema/search_customer_request.json --just-types --lang ts -o ./src/types/SearchCreditsRequest.ts
     * quicktype -s schema ./src/schema/search_transactions --just-types --lang ts -o ./src/types/SearchCreditsRequest.ts
     * quicktype -s schema ./src/schema/credits.json --just-types --lang ts -o ./src/types/Credits.ts
     * quicktype -s schema ./src/schema/mongodb/schema/users.json --just-types --lang ts -o ./src/types/Users.ts
     * quicktype -s schema ./src/schema/mongodb/schema/transactions.json --just-types --lang ts -o ./src/types/Transactions.ts
     * quicktype -s schema ./src/schema/mongodb/schema/charge_report_logs_.json --just-types --lang ts -o ./src/types/ChargeReportLogsts.ts
     * quicktype -s schema ./src/schema/mongodb/schema/creditor_companies.json --just-types --lang ts -o ./src/types/CreditorCompanies.ts
     * quicktype -s schema ./src/schema/mongodb/schema/credits.json --just-types --lang ts -o ./src/types/Credits.ts
     * quicktype -s schema ./src/schema/mongodb/schema/customers.json --just-types --lang ts -o ./src/types/Customers.ts
     * quicktype -s schema ./src/schema/mongodb/schema/late_payment_feeLogs.json --just-types --lang ts -o ./src/types/LatePaymentFeelogs.ts
     * quicktype -s schema ./src/schema/mongodb/schema/wallets.json --just-types --lang ts -o ./src/types/Wallets.ts
     * quicktype -s schema ./src/schema/mongodb/schema/transactions.json --just-types --lang ts -o ./src/types/Transactions.ts
     * quicktype -s schema ./src/schema/mongodb/schema/search_employees_request.json --just-types --lang ts -o ./src/types/SearchEmployeesRequest.ts
     */
}