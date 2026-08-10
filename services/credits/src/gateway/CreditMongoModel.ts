import { injectable } from "inversify";
import { CreditsModel, ICredits, ICreditsWithCustomerBasicInformation } from "../schema/mongodb/models/CreditsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { map, mergeMap, Observable, of } from "rxjs";
import { ICustomers } from "../schema/mongodb/models/Customers.Model";
import { Aggregate, PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { defaultTo, get } from "lodash";

@injectable()
export class CreditMongoModel extends BaseMongoModel<ICredits> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(CreditsModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/

  public findCreditsJoinCustomer(
    creditFilters: QueryFilter<ICredits>,
    customerFilters: QueryFilter<ICustomers>,
    pagination: QueryOptions
  ): Observable<{
    documents: ICreditsWithCustomerBasicInformation[],
    totalDocuments: number
  }> {
    return of(true).pipe(
      mergeMap(() => this.model.aggregate(this._buildPipelineToUser(creditFilters, customerFilters, pagination))),
      map((result: Aggregate<{ data: any[], totalCount: { count: number }[] }>[]) => ({
        documents: get(result, "[0].data", []),
        totalDocuments: get(result, "[0].totalCount[0].count", 0)
      }))
    );
  }

  // Construct Pipeline
  public _buildPipelineToUser(
    creditFilters: QueryFilter<ICredits>,
    customerFilters: QueryFilter<ICustomers>,
    pagination: QueryOptions
  ): PipelineStage[] {
    return [
      // Stage 1: Filter documents first for performance
      { $match: creditFilters },
      // Stage 2: Join related collection (e.g., 'categories')
      {
        $lookup: {
          from: CollectionNameEnum.CUSTOMERS,
          let: { creditCustomerId: "$userId" },
          localField: "customerId",
          foreignField: "_id",
          pipeline: [
            // Filter 1: Primary Join Condition (User._id === Order.userId)
            {
              $match: {
                $expr: {
                  $and: [
                    // Filter 1: Primary Join Condition (User._id === Order.userId)
                    { $eq: ['$_id', '$$creditCustomerId'] },
                  ]
                },
                ...customerFilters
                /*$expr: {
                  $and: [
                    // Filter 1: Primary Join Condition (User._id === Order.userId)
                    //{ $eq: ['$_id', '$$creditCustomerId'] },
                    
                  ]
                }*/
              }
            },
          ],
          as: "customerInfo",
        },
      },
      // Stage 3: Sort results consistently for pagination
      { $sort: { createdAt: -1 } },
      // Stage 4: Facet stage to split into data slice and total count
      {
        $facet: {
          data: [{ $skip: defaultTo(pagination.skip, 1) }, { $limit: defaultTo(pagination.limit, 1) }],
          totalCount: [{ $count: 'count' }],
        },
      }
    ]
  }
}