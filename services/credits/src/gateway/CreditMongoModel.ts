import { inject, injectable } from "inversify";
import { CreditsModel, ICredits, ICreditsWithCustomerBasicInformation } from "../schema/mongodb/models/CreditsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { map, mergeMap, Observable, of } from "rxjs";
import { ICustomers } from "../schema/mongodb/models/Customers.Model";
import { Aggregate, PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { defaultTo, get } from "lodash";
import { TransactionStatusEnum } from "../infrastructure/TransactionStatusEnum";
import { ILoggerGateway } from "../repository/ILoggerGateway";
import { TYPES } from "../constant/types";
import { PaymentCategoryEnum } from "../infrastructure/PaymentCategoryEnum";
import { CreditStatusEnum } from "../infrastructure/CreditStatusEnum";

@injectable()
export class CreditMongoModel extends BaseMongoModel<ICredits> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(CreditsModel, logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
  // findCreditsJoinCustomer — mobile (searchCreditsByEmployee). No trae
  // employeeInfo: ver findCreditsJoinCustomerAndEmployee para eso (web).
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
      mergeMap(() => this.model.aggregate(this._buildPipelineToUserAndEmployee(creditFilters, customerFilters, pagination))),
      map((result: Aggregate<{ data: any[], totalCount: { count: number }[] }>[]) => ({
        documents: get(result, "[0].data", []),
        totalDocuments: get(result, "[0].totalCount[0].count", 0)
      }))
    );
  }

  public _buildPipelineToUserAndEmployee(
    creditFilters: QueryFilter<ICredits>,
    customerFilters: QueryFilter<ICustomers>,
    pagination: QueryOptions
  ): PipelineStage[] {
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
  }

  public _buildCreditTotalsPipeline(
    creditFilters: QueryFilter<ICredits>,
    startDate: Date,
    endDate: Date
  ): PipelineStage[] {

    return [

      // Stage 1:
      // Filtrar créditos. El $or de status (activos + pagados/renovados
      // dentro del periodo) ya viene armado en creditFilters, construido por
      // UserRoleEmployeeTotalsCatalog — este pipeline no necesita saber nada
      // de esa regla, solo aplica el filtro que le llega.
      {
        $match: creditFilters,
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
                  TransactionStatusEnum.APPROVED,
                  //paymentCategory: PaymentCategoryEnum.CHARGE_PERIOD

              },
            },

            {
              $project: {
                _id: 0,
                total: 1,
                paymentCategory: 1
              }
            }
          ],

          as: "payments"
        }
      },

      // Stage 3:
      // Clasificar los pagos del periodo (no se excluye ninguno):
      // paymentCategory === CHARGE_PERIOD -> paidAmount (cuota regular)
      // cualquier otro valor, o si no trae paymentCategory -> otherAmount
      {
        $addFields: {
          paidAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "p",
                in: {
                  $cond: [
                    { $eq: ["$$p.paymentCategory", PaymentCategoryEnum.CHARGE_PERIOD] },
                    "$$p.total",
                    0
                  ]
                }
              }
            }
          },
          otherAmount: {
            $sum: {
              $map: {
                input: "$payments",
                as: "p",
                in: {
                  $cond: [
                    { $ne: ["$$p.paymentCategory", PaymentCategoryEnum.CHARGE_PERIOD] },
                    "$$p.total",
                    0
                  ]
                }
              }
            }
          }
        }
      },
      // Stage 4:
      // Sumar todo en un solo total, sin agrupar por frecuencia.
      // totalToCollect solo cuenta créditos todavía activos (charge_process):
      // el $match de creditFilters ya no filtra por status, así que un crédito
      // recién liquidado/renovado (paid) sigue en el pipeline para que sus pagos
      // cuenten en totalCollected/totalOthers, pero no debe seguir sumando a
      // "por cobrar".
      // Ojo: totalCollected/totalOthers solo cubren pagos dentro de
      // [startDate, endDate) del Stage 2 — ese rango se recorta al periodo de
      // corte vigente (ej. cada lunes para semanal, ver
      // resolveChargeFrequencyDateRange en el front). En cuanto pasa ese
      // corte y arranca un periodo nuevo, un pago de liquidación/renovación
      // de la semana pasada deja de contar aunque el crédito siga "paid".
      {
        $group: {

          _id: null,

          totalToCollect: {
            $sum: {
              $cond: [
                { $eq: ["$status", CreditStatusEnum.CHARGE_PROCESS] },
                "$fixedCharge",
                0
              ]
            }
          },

          totalCollected: {
            $sum: "$paidAmount"
          },

          totalOthers: {
            $sum: "$otherAmount"
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

          totalOthers: 1,

          totalPending: {
            $max: [
              {
                $subtract: [
                  "$totalToCollect",
                  "$totalCollected"
                ]
              },
              0
            ]
          }
        }
      }
    ];
  }

}