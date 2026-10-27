import { PipelineStage, QueryFilter } from "mongoose";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { CollectionNameEnum } from "../CollectionNameEnum";
import { TransactionStatusEnum } from "../TransactionStatusEnum";
import { PaymentCategoryEnum } from "../PaymentCategoryEnum";
import { CreditStatusEnum } from "../CreditStatusEnum";

export interface CreditTotalsPipelineParams {
    creditFilters: QueryFilter<ICredits>;
    startDate: Date;
    endDate: Date;
}

// Totales del periodo: por cobrar, cobrado, otros y pendiente (getCreditTotals).
export const buildCreditTotalsPipeline = (
  { creditFilters, startDate, endDate }: CreditTotalsPipelineParams
): PipelineStage[] => {
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
    // liquidation / renewal / firstCharge (o si no trae paymentCategory) -> otherAmount
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
};
