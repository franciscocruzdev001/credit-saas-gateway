import { injectable } from "inversify";
import { CreditsModel, ICredits, ICreditsWithCustomerBasicInformation } from "../schema/mongodb/models/CreditsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { map, mergeMap, Observable, of } from "rxjs";
import { ICustomers } from "../schema/mongodb/models/Customers.Model";
import { Aggregate, PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { defaultTo, get } from "lodash";
import { TransactionStatusEnum } from "../infrastructure/TransactionStatusEnum";

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


  public getCreditTotals(
    creditFilters: QueryFilter<ICredits>,
    startDate: Date,
    endDate: Date
  ): Observable<Object> {

    return of(true).pipe(
      mergeMap(() =>
        this.model.aggregate(
          this._buildCreditTotalsPipeline(
            creditFilters,
            startDate,
            endDate
          )
        )
      )
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
  }

  public _buildCreditTotalsPipeline(
    creditFilters: QueryFilter<ICredits>,
    startDate: Date,
    endDate: Date
): PipelineStage[] {

    return [

        // Stage 1:
        // Filtrar créditos
        {
            $match: creditFilters , 
        },

        // Stage 2:
        // Buscar pagos relacionados al crédito
        // y que estén dentro del periodo consultado.
        {
            $lookup: {

                from: CollectionNameEnum.PAYMENTS,

                let: {
                    creditId: "$_id"
                },

                pipeline: [

                    {
                        $match: {

                            $expr: {
                                $and: [

                                    // Payment pertenece al Credit
                                    {
                                        $eq: [
                                            "$creditId",
                                            "$$creditId"
                                        ]
                                    },

                                    // Payment >= fecha inicio
                                    {
                                        $gte: [
                                            "$createdAt",
                                            startDate
                                        ]
                                    },

                                    // Payment <= fecha término
                                    {
                                        $lt: [
                                            "$createdAt",
                                            endDate
                                        ]
                                    }
                                ]
                            },

                            // Solo pagos aprobados
                            transactionStatus:
                                TransactionStatusEnum.APPROVED
                        }
                    },

                    {
                        $project: {
                            _id: 0,
                            total: 1
                        }
                    }
                ],

                as: "payments"
            }
        },

        // Stage 3:
        // Sumar pagos aprobados del periodo
        {
            $addFields: {
                paidAmount: {
                    $ifNull: [
                        {
                            $sum: "$payments.total"
                        },
                        0
                    ]
                }
            }
        },

        // Stage 4:
        // Sumar todo en un solo total, sin agrupar por frecuencia
        {
            $group: {

                _id: null,

                totalToCollect: {
                    $sum: "$fixedCharge"
                },

                totalCollected: {
                    $sum: "$paidAmount"
                }
            }
        },

        // Stage 5:
        // Calcular pendiente
        {
            $project: {

                _id: 0,

                totalToCollect: 1,

                totalCollected: 1,

                totalPending: {
                    $subtract: [
                        "$totalToCollect",
                        "$totalCollected"
                    ]
                }
            }
        }
    ];
  }

}