import { PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { ICustomers } from "../../schema/mongodb/models/Customers.Model";
import { CollectionNameEnum } from "../CollectionNameEnum";
import { defaultTo } from "lodash";

export interface CreditsWithCustomerPipelineParams {
    creditFilters: QueryFilter<ICredits>;
    customerFilters: QueryFilter<ICustomers>;
    pagination: QueryOptions;
}

// Créditos con su cliente y su último pago — mobile (searchCreditsByEmployee).
export const buildCreditsWithCustomerPipeline = (
  { creditFilters, customerFilters, pagination }: CreditsWithCustomerPipelineParams
): PipelineStage[] => {
  return [
    // Stage 1: Filter documents first for performance
    { $match: creditFilters },
    // Stage 2: Join related collection (e.g., 'categories')
    {
      $lookup: {
        from: CollectionNameEnum.CUSTOMERS,
        let: { creditCustomerId: "$customerId" },
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
    // Stage 3 — NUEVO: descarta créditos cuyo customer no matcheó el filtro
    { $match: { customerInfo: { $ne: [] } } },
    // Stage 3.5 — NUEVO: último Payment generado de cada crédito
    {
      $lookup: {
        from: CollectionNameEnum.PAYMENTS,
        let: { creditId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$creditId", "$$creditId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { _id: 0, createdAt: 1, transactionStatus: 1, total: 1 } }
        ],
        as: "lastPayment",
      },
    },
    { $unwind: { path: "$lastPayment", preserveNullAndEmptyArrays: true } },
    // Stage 4: Sort results consistently for pagination
    { $sort: { createdAt: -1 } },

    {
      $facet: {
        data: [{ $skip: defaultTo(pagination.skip, 1) }, { $limit: defaultTo(pagination.limit, 1) }],
        totalCount: [{ $count: 'count' }],
      },
    }
  ]
};
