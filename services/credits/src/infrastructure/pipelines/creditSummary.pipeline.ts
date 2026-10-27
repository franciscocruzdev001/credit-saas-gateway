import { PipelineStage, QueryFilter } from "mongoose";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { CollectionNameEnum } from "../CollectionNameEnum";
import { TransactionStatusEnum } from "../TransactionStatusEnum";
import { CreationStatusEnum } from "../CreationStatusEnum";

export interface CreditSummaryPipelineParams {
    creditFilters: QueryFilter<ICredits>;
    startDate: Date;
    endDate: Date;
}

// Resumen del periodo por frecuencia: cobrados, nuevos y renovados (getCreditSummary).
export const buildCreditSummaryPipeline = (
  { creditFilters, startDate, endDate }: CreditSummaryPipelineParams
): PipelineStage[] => {
  return [

    // Stage 1:
    // Filtrar créditos. El filtro por rol (cobrador / empresa, solo
    // aprobados) ya viene armado en creditFilters, construido por
    // UserRoleEmployeeSummaryCatalog.
    {
      $match: creditFilters,
    },

    // Stage 2:
    // Buscar los pagos del crédito realizados dentro del periodo.
    // Solo pagos aprobados y mayores a $0 (las faltas no cuentan).
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

                  // Payment < fecha término
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

              // Las faltas (pagos en $0) no cuentan como cobro
              total: { $gt: 0 }
            },
          },

          {
            $project: {
              _id: 1
            }
          }
        ],

        as: "payments"
        
      }
    },

    // Stage 3:
    // Contar por frecuencia de cobro (solo conteos):
    // collected -> número de pagos registrados en el periodo (cada pago suma 1)
    // new / renewed -> créditos dados de alta en el periodo
    // según creationStatus; sin creationStatus se toma como "new".
    {
      $group: {

        _id: "$chargeRules.chargeFrequency",

        collected: {
          $sum: { $size: "$payments" }
        },

        new: {
          $sum: {
            $cond: [
              { //El crédito fue creado dentro del periodo y NO es renovación.
                $and: [
                  { $gte: ["$admissionDate", startDate] },
                  { $lt: ["$admissionDate", endDate] },
                  { $ne: ["$creationStatus", CreationStatusEnum.RENEWED] }
                ]
              },
              1,
              0
            ]
          }
        },

        renewed: {
          $sum: {
            $cond: [
              {//El crédito fue creado dentro del periodo y SÍ es renovación
                $and: [
                  { $gte: ["$admissionDate", startDate] },
                  { $lt: ["$admissionDate", endDate] },
                  { $eq: ["$creationStatus", CreationStatusEnum.RENEWED] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },

    // Stage 4:
    // Dar forma a la respuesta
    {
      $project: {

        _id: 0,

        chargeFrequency: "$_id",

        collected: 1,

        new: 1,

        renewed: 1
      }
    }
  ];
};
