import { PipelineStage, QueryFilter } from "mongoose";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { CollectionNameEnum } from "../CollectionNameEnum";
import { TransactionStatusEnum } from "../TransactionStatusEnum";

export interface CreditPaymentsAndIncidentsPipelineParams {
    creditFilters: QueryFilter<ICredits>;
}

// Historial de un crédito en dos listas: pagos confirmados mayores a $0 e
// incidencias (faltas) registradas — getCreditPaymentsAndIncidents.
export const buildCreditPaymentsAndIncidentsPipeline = (
  { creditFilters }: CreditPaymentsAndIncidentsPipelineParams
): PipelineStage[] => {
  return [

    // Stage 1:
    // El crédito solicitado. creditFilters trae su _id y la empresa (y el
    // cobrador, si es CREDIT_COLLECTOR) del JWT, así nadie consulta créditos ajenos.
    {
      $match: creditFilters,
    },

    // Stage 2:
    // Pagos del crédito: solo aprobados y mayores a $0, del más antiguo al más reciente.
    {
      $lookup: {
        from: CollectionNameEnum.PAYMENTS,
        let: { creditId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$creditId", "$$creditId"] },
              transactionStatus: TransactionStatusEnum.APPROVED,
              total: { $gt: 0 }
            }
          },
          { $sort: { createdAt: 1 } },
          {
            $project: {
              _id: 1,
              total: 1,
              paymentCategory: 1,
              transactionStatus: 1,
              transactionId: 1,
              createdAt: 1
            }
          }
        ],
        as: "payments"
      }
    },

    // Stage 3:
    // Incidencias (faltas) del crédito, del más antigua a la más reciente.
    // No tienen transactionStatus: cada una es una falta, no una transacción.
    {
      $lookup: {
        from: CollectionNameEnum.INCIDENTS,
        let: { creditId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$creditId", "$$creditId"] } } },
          { $sort: { createdAt: 1 } },
          {
            $project: {
              _id: 1,
              latePaymentCharge: 1,
              description: 1,
              currency: 1,
              createdAt: 1
            }
          }
        ],
        as: "incidents"
      }
    },

    // Stage 4:
    // Solo las dos listas.
    {
      $project: {
        _id: 1,
        payments: 1,
        incidents: 1
      }
    }
  ];
};
