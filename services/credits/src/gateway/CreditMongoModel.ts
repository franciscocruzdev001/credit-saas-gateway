import { inject, injectable } from "inversify";
import { CreditsModel, ICredits, ICreditsWithCustomerBasicInformation } from "../schema/mongodb/models/CreditsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { map, mergeMap, Observable, of } from "rxjs";
import { ICustomers } from "../schema/mongodb/models/Customers.Model";
import { Aggregate, QueryFilter, QueryOptions } from "mongoose";
import { get } from "lodash";
import { ILoggerGateway } from "../repository/ILoggerGateway";
import { TYPES } from "../constant/types";
import { CreditPipelineEnum } from "../infrastructure/CreditPipelineEnum";
import { CreditPipelineCatalog } from "../infrastructure/catalogs/CreditPipelineCatalog";

@injectable()
export class CreditMongoModel extends BaseMongoModel<ICredits> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(CreditsModel, logger);
  }
  // Los pipelines se arman en CreditPipelineCatalog (un archivo por consulta en
  // infrastructure/pipelines); aquí solo se ejecutan y se da forma a la respuesta.


  public findCreditsJoinCustomer(
    creditFilters: QueryFilter<ICredits>,
    customerFilters: QueryFilter<ICustomers>,
    pagination: QueryOptions
  ): Observable<{
    documents: ICreditsWithCustomerBasicInformation[],
    totalDocuments: number
  }> {
    return of(true).pipe(
      mergeMap(() => this.model.aggregate(
        CreditPipelineCatalog[CreditPipelineEnum.CREDITS_WITH_CUSTOMER]({ creditFilters, customerFilters, pagination })
      )),
      map((result: Aggregate<{ data: any[], totalCount: { count: number }[] }>[]) => ({
        documents: get(result, "[0].data", []),
        totalDocuments: get(result, "[0].totalCount[0].count", 0)
      }))
    );
  }

  public getCreditTotals(
    creditFilters: QueryFilter<ICredits>,
    startDate: Date,
    endDate: Date
  ): Observable<Object> {
    return of(true).pipe(
      mergeMap(() => this.model.aggregate(
        CreditPipelineCatalog[CreditPipelineEnum.CREDIT_TOTALS]({ creditFilters, startDate, endDate })
      ))
    );
  }

  public getCreditSummary(
    creditFilters: QueryFilter<ICredits>,
    startDate: Date,
    endDate: Date
  ): Observable<Object> {
    return of(true).pipe(
      mergeMap(() => this.model.aggregate(
        CreditPipelineCatalog[CreditPipelineEnum.CREDIT_SUMMARY]({ creditFilters, startDate, endDate })
      ))
    );
  }

  // getCreditPaymentsAndIncidents — historial de un crédito: pagos confirmados
  // (> $0) e incidencias. Regresa {} si el crédito no existe o no es visible
  // para quien consulta.
  public getCreditPaymentsAndIncidents(
    creditFilters: QueryFilter<ICredits>
  ): Observable<Object> {
    return of(true).pipe(
      mergeMap(() => this.model.aggregate(
        CreditPipelineCatalog[CreditPipelineEnum.CREDIT_PAYMENTS_AND_INCIDENTS]({ creditFilters })
      )),
      map((result: Object[]) => get(result, "[0]", {}))
    );
  }

  // findCreditsJoinCustomerAndEmployee — de grado administrativo (web, searchCredits).
  public findCreditsJoinCustomerAndEmployee(
    creditFilters: QueryFilter<ICredits>,
    customerFilters: QueryFilter<ICustomers>,
    pagination: QueryOptions
  ): Observable<{
    documents: ICreditsWithCustomerBasicInformation[],
    totalDocuments: number
  }> {
    return of(true).pipe(
      mergeMap(() => this.model.aggregate(
        CreditPipelineCatalog[CreditPipelineEnum.CREDITS_WITH_CUSTOMER_AND_EMPLOYEE]({ creditFilters, customerFilters, pagination })
      )),
      map((result: Aggregate<{ data: any[], totalCount: { count: number }[] }>[]) => ({
        documents: get(result, "[0].data", []),
        totalDocuments: get(result, "[0].totalCount[0].count", 0)
      }))
    );
  }
}
