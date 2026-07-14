import { map, mergeMap, Observable, of, throwError } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document, Filter } from 'mongodb';
import { ICreditService } from "../repository/ICreditService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { FiltersItems as FilterItemsCustomers, SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { filter, get, isEmpty, isNil, isObject, isUndefined, omit, omitBy } from "lodash"
import { FiltersItems as FilterItemsEmployees, SearchEmployeesRequest } from "../types/SearchEmployeesRequest";
import { FiltersItems as FilterItemsCredits, SearchCreditsRequest } from "../types/SearchCreditsRequest"
import { CreditMongoModel } from "../gateway/CreditMongoModel";




@injectable()
export class CreditService implements ICreditService {
    private readonly _mongodb: IMongoGateway;
    private readonly _creditMongoModel: CreditMongoModel;

    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.CreditMongoModel) creditMongoModel: CreditMongoModel,
    ) {
        this._mongodb = mongodb;
        this._creditMongoModel = creditMongoModel;
    }

    public searchCredits(
        searchCreditsData: SearchCreditsRequest
    ): Observable<Object> {

        const dbName: string = "admin";
        const salto = (get(searchCreditsData, "pagination.pageNumber", 1)) * get(searchCreditsData, "pagination.limit", 0)

        console.log("searchCredits-searchCreditsData: ", searchCreditsData);
        console.log("searchCredits-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findDocuments(dbName, CollectionNameEnum.CREDITS_TEST,
                    this._buildSearchFiltersByCredits(searchCreditsData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchCreditsData, "pagination.limit", 0)
                    }
                )
                /*this._creditMongoModel.findDocuments(
                    this._buildSearchFiltersByCredits(searchCreditsData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchCreditsData, "pagination.limit", 0)
                    }
                )*/
            ),
            map((dataResponse: { documents: Document[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
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
                this._mongodb.findDocuments(dbName, CollectionNameEnum.PRUEBA,
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

    public searchEmployees(
        searchEmployeeData: SearchEmployeesRequest
    ): Observable<Object> {

        const dbName: string = "admin";
        const salto = (get(searchEmployeeData, "pagination.pageNumber", 1)) * get(searchEmployeeData, "pagination.limit", 0)

        console.log("searchCustomer-searchEmployeeData: ", searchEmployeeData);
        console.log("searchCustomer-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findDocuments(dbName, CollectionNameEnum.EMPLOYEES_TEST,
                    this._buildSearchFiltersByEmployees(searchEmployeeData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchEmployeeData, "pagination.limit", 0)
                    }
                )
            ),
            map((dataResponse: { documents: Document[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }

    private _buildSearchFiltersByCustomers(filters: FilterItemsCustomers): Filter<Document> {
        const queryFilter = {
            //status: get(searchCustomerData, "status", undefined),
            status: isEmpty(get(filters, "status", [])) ? undefined : {
                $in: get(filters, "status", []),
            },
            createdByEmployeeId: get(filters, "createdByEmployeeId", undefined)
        }
        console.log("buildSearchFiltersByCustomers-queryFilter:", queryFilter);
        return omitBy(queryFilter,
            (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value)) || value === "";
            }
        )

    }

    private _buildSearchFiltersByEmployees(filters: FilterItemsEmployees): Filter<Document> {
        console.log("buildSearchFiltersByEmployees-filters:", filters);
        const queryFilter = {
            //status: get(searchCustomerData, "status", undefined),
            status: isEmpty(get(filters, "status", [])) ? undefined : {
                $in: get(filters, "status", []),
            },
            creditorCompanyId: get(filters, "creditorCompanyId", undefined)
        }
        console.log("buildSearchFiltersByEmployees-queryFilter:", queryFilter);
        return omitBy(queryFilter,
            (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value)) || value === "";
            }
        )

    }

    private _buildSearchFiltersByCredits(filters: FilterItemsCredits): Filter<Document> {
        console.log("buildSearchFiltersByCredits-filters:", filters);
        const queryFilter = {
            //status: get(searchCreditsData, "status", undefined),
            status: isEmpty(get(filters, "status", [])) ? undefined : {
                $in: get(filters, "status", []),
            },
            creditorCompanyId: get(filters, "creditorCompanyId", undefined)
        }
        console.log("buildSearchFiltersByEmployees-queryFilter:", queryFilter);
        return omitBy(queryFilter,
            (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value)) || value === "";
            }
        )

    }
    /***
     * quicktype -s schema ./src/schema/search_customers_request.json --just-types --lang ts -o ./src/types/SearchCustomersRequest.ts
     */

    /***
     * quicktype -s schema ./src/schema/search_employees_request.json --just-types --lang ts -o ./src/types/SearchEmployeesRequest.ts
     * quicktype -s schema ./src/schema/search_transactions.request.json --just-types --lang ts -o ./src/types/SearchTransactionsRequest.ts
     * quicktype -s schema ./src/schema/credit_table.json --just-types --lang ts -o ./src/types/CreditTable.ts
     * 
     * quicktype -s schema ./src/schema/search_credits_request.json --just-types --lang ts -o ./src/types/SearchCreditsRequest.ts
     * quicktype -s schema ./src/schema/search_transactions --just-types --lang ts -o ./src/types/SearchCreditsRequest.ts
     * quicktype -s schema ./src/schema/credits.json --just-types --lang ts -o ./src/types/Credits.ts
     * quicktype -s schema ./src/schema/mongodb/schema/users.json --just-types --lang ts -o ./src/types/Users.ts
     * quicktype -s schema ./src/schema/mongodb/schema/charge_report_logs_.json --just-types --lang ts -o ./src/types/ChargeReportLogsts.ts
     * quicktype -s schema ./src/schema/mongodb/schema/creditor_companies.json --just-types --lang ts -o ./src/types/CreditorCompanies.ts
     * quicktype -s schema ./src/schema/mongodb/schema/credits.json --just-types --lang ts -o ./src/types/Credits.ts
     * quicktype -s schema ./src/schema/mongodb/schema/customers.json --just-types --lang ts -o ./src/types/Customers.ts
     * quicktype -s schema ./src/schema/mongodb/schema/late_payment_feeLogs.json --just-types --lang ts -o ./src/types/LatePaymentFeelogs.ts
     * quicktype -s schema ./src/schema/mongodb/schema/wallets.json --just-types --lang ts -o ./src/types/Wallets.ts
     * quicktype -s schema ./src/schema/mongodb/schema/transactions.json --just-types --lang ts -o ./src/types/Transactions.ts
     */
}