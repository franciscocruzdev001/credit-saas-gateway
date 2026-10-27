import { PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { ICustomers } from "../../schema/mongodb/models/Customers.Model";
import { CollectionNameEnum } from "../CollectionNameEnum";
import { defaultTo } from "lodash";

export interface CreditsWithCustomerAndEmployeePipelineParams {
    creditFilters: QueryFilter<ICredits>;
    customerFilters: QueryFilter<ICustomers>;
    pagination: QueryOptions;
}

// Créditos con su cliente y el empleado (cobrador) dueño — web (searchCredits).
export const buildCreditsWithCustomerAndEmployeePipeline = (
  { creditFilters, customerFilters, pagination }: CreditsWithCustomerAndEmployeePipelineParams
): PipelineStage[] => {
  return [
    // Stage 1: Filter documents first for performance
    { $match: creditFilters },
    // Stage 2: Join customers
    {
      $lookup: {
        from: CollectionNameEnum.CUSTOMERS,
        let: { creditCustomerId: "$customerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$creditCustomerId'] },
                ]
              },
              ...customerFilters
            }
          },
        ],
        as: "customerInfo",
      },
    },
    // Stage 3: descarta créditos cuyo customer no matcheó el filtro
    { $match: { customerInfo: { $ne: [] } } },
    // Stage 3.4: datos del empleado (cobrador) dueño del crédito.
    {
      $lookup: {
        from: CollectionNameEnum.USERS,
        let: { creditUserId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$creditUserId'] } } },
          { $project: { "contact.name": 1, "contact.lastName": 1, "contact.phoneNumber": 1 } }
        ],
        as: "employeeInfo",
      },
    },
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
