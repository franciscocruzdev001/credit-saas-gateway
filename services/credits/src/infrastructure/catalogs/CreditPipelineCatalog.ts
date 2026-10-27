import { PipelineStage } from "mongoose";
import { CreditPipelineEnum } from "../CreditPipelineEnum";
import { buildCreditsWithCustomerPipeline, CreditsWithCustomerPipelineParams } from "../pipelines/creditsWithCustomer.pipeline";
import { buildCreditsWithCustomerAndEmployeePipeline, CreditsWithCustomerAndEmployeePipelineParams } from "../pipelines/creditsWithCustomerAndEmployee.pipeline";
import { buildCreditTotalsPipeline, CreditTotalsPipelineParams } from "../pipelines/creditTotals.pipeline";
import { buildCreditSummaryPipeline, CreditSummaryPipelineParams } from "../pipelines/creditSummary.pipeline";
import { buildCreditPaymentsAndIncidentsPipeline, CreditPaymentsAndIncidentsPipelineParams } from "../pipelines/creditPaymentsAndIncidents.pipeline";

// Parámetros que recibe cada consulta: unas llevan paginación y filtros de
// cliente, otras un rango de fechas.
export type CreditPipelineParams = {
    [CreditPipelineEnum.CREDITS_WITH_CUSTOMER]: CreditsWithCustomerPipelineParams;
    [CreditPipelineEnum.CREDITS_WITH_CUSTOMER_AND_EMPLOYEE]: CreditsWithCustomerAndEmployeePipelineParams;
    [CreditPipelineEnum.CREDIT_TOTALS]: CreditTotalsPipelineParams;
    [CreditPipelineEnum.CREDIT_SUMMARY]: CreditSummaryPipelineParams;
    [CreditPipelineEnum.CREDIT_PAYMENTS_AND_INCIDENTS]: CreditPaymentsAndIncidentsPipelineParams;
};

// Relaciona el nombre de la consulta con la función que arma su pipeline.
// Solo mapea nombres: cada pipeline vive en su propio archivo en ../pipelines.
export const CreditPipelineCatalog: {
    [K in CreditPipelineEnum]: (params: CreditPipelineParams[K]) => PipelineStage[]
} = {
    [CreditPipelineEnum.CREDITS_WITH_CUSTOMER]: buildCreditsWithCustomerPipeline,
    [CreditPipelineEnum.CREDITS_WITH_CUSTOMER_AND_EMPLOYEE]: buildCreditsWithCustomerAndEmployeePipeline,
    [CreditPipelineEnum.CREDIT_TOTALS]: buildCreditTotalsPipeline,
    [CreditPipelineEnum.CREDIT_SUMMARY]: buildCreditSummaryPipeline,
    [CreditPipelineEnum.CREDIT_PAYMENTS_AND_INCIDENTS]: buildCreditPaymentsAndIncidentsPipeline
};
