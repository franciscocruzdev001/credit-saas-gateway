import { map, mergeMap, Observable, of, throwError } from "rxjs";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document, Filter } from 'mongodb';
import { ICreditService } from "../repository/ICreditService";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { FiltersItems as FilterItemsCustomers, SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { filter, get, isEmpty, isNil, isObject, isUndefined, omit, omitBy } from "lodash"
import { FiltersItems as FilterItemsEmployees, SearchEmployeesRequest  } from "../types/SearchEmployeesRequest";



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










    /***
     * quicktype -s schema ./src/schema/search_customers_request.json --just-types --lang ts -o ./src/types/SearchCustomersRequest.ts
     */

    /***
     * quicktype -s schema ./src/schema/search_employees_request.json --just-types --lang ts -o ./src/types/SearchEmployeesRequest.ts
     */

}