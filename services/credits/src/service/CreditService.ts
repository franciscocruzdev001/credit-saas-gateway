import { map, mergeMap, Observable, of, throwError } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document, Filter } from 'mongodb';
import { ICreditService } from "../repository/ICreditService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { FiltersItems as FilterItemsCustomers, SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { defaultTo, filter, get, isEmpty, isNil, isObject, isUndefined, omit, omitBy } from "lodash"

import { FiltersItems as FilterItemsCredits, SearchCreditsRequest } from "../types/SearchCreditsRequest"
import { CreditMongoModel } from "../gateway/CreditMongoModel";
import { QueryOptions, Types } from "mongoose";
import { ICredits } from "../schema/mongodb/models/CreditsModel";
import { CustomersMongoModel } from "../gateway/CutomersMongoModel";
import { QueryFilter } from "mongoose";
import { UserRoleEnum } from "../infrastructure/UserRoleEnum";
import { UserRoleEmployeeCatalog } from "../infrastructure/catalogs/UserRoleCatalogs";
import { SearchCreditsByEmployeeRequest } from "../types/SearchCreditsByEmployeeRequest";


@injectable()
export class CreditService implements ICreditService {
    private readonly _mongodb: IMongoGateway;
    private readonly _creditMongoModel: CreditMongoModel;
    private readonly _customerMongoModel: CustomersMongoModel;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.CreditMongoModel) creditMongoModel: CreditMongoModel,
        @inject(TYPES.CustomersMongoModel) customersMongoModel: CustomersMongoModel,
    ) {
        this._mongodb = mongodb;
        this._creditMongoModel = creditMongoModel;
        this._customerMongoModel = customersMongoModel
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
        const salto = (get(searchCreditsData, "pagination.pageNumber", 1)) * get(searchCreditsData, "pagination.limit", 0)

        console.log("searchCreditsByEmployee-searchCreditsData: ", searchCreditsData);
        console.log("searchCreditsByEmployee-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._searchCredits(
                    UserRoleEmployeeCatalog[UserRoleEnum.MANAGER]!(searchCreditsData.filtersItems),
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

    private _buildSearchFiltersByCustomers(filters: FilterItemsCustomers): Filter<Document> {
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