import { inject, injectable } from "inversify";
import { TransactionsModel, ITransactions } from "../schema/mongodb/models/TransactionsModel";
import { ICredits } from "../schema/mongodb/models/CreditsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { TYPES } from "../constant/types";
import { ILoggerGateway } from "../repository/ILoggerGateway";
import { Aggregate, PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { map, mergeMap, Observable, of } from "rxjs";
import { get, isEmpty } from "lodash";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";

@injectable()
export class TransactionMongoModel extends BaseMongoModel<ITransactions> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(TransactionsModel, logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/

  public findTransactionsJoinCredit(
    transactionFilters: QueryFilter<ITransactions>,
    creditFilters: QueryFilter<ICredits>,
    pagination: QueryOptions
  ): Observable<{ documents: any[], totalDocuments: number }> {
    return of(true).pipe(
      mergeMap(() => {
        const pipelineStage: PipelineStage[] = this._buildPipelineToCredit(transactionFilters, creditFilters, pagination);
        console.log("findTransactionsJoinCredit-pipelineStage: ", JSON.stringify(pipelineStage,
          null, 2
        ));
        return this.model.aggregate(pipelineStage)
      }),
      map((result: Aggregate<{ data: any[], totalCount: { count: number }[] }>[]) => ({
        documents: get(result, "[0].data", []),
        totalDocuments: get(result, "[0].totalCount[0].count", 0)
      }))
    );
  }

  private _buildPipelineToCredit(
    transactionFilters: QueryFilter<ITransactions>,
    creditFilters: QueryFilter<ICredits>,
    pagination: QueryOptions
  ): PipelineStage[] {
    return [
      { $match: transactionFilters },
      {
        $lookup: {
          from: CollectionNameEnum.CREDITS,
          let: {
            creditIdSource: "$creditIdSource",
            transactionId: "$_id"
          },
          pipeline: [
            {
              $match: {
                $or: [
                  { $expr: { $eq: ["$_id", "$$creditIdSource"] } },
                  { $expr: { $eq: ["$transactionId", "$$transactionId"] } }
                ],
                ...creditFilters
              }
            },
            {
              $lookup: {
                from: CollectionNameEnum.CUSTOMERS,
                let: { creditCustomerId: "$customerId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$creditCustomerId"] } } }
                ],
                as: "customerInfo"
              }
            }
          ],
          as: "creditInfo"
        }
      },
      ...(!isEmpty(creditFilters) ? [{ $match: { creditInfo: { $ne: [] } } }] : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: get(pagination, "skip", 0) }, { $limit: get(pagination, "limit", 10) }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];
  }
}
