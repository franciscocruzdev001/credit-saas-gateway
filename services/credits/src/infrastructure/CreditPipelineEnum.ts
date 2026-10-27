// Nombre de cada consulta (pipeline de agregación) sobre créditos.
export enum CreditPipelineEnum {
    CREDITS_WITH_CUSTOMER = "creditsWithCustomer",                          // mobile
    CREDITS_WITH_CUSTOMER_AND_EMPLOYEE = "creditsWithCustomerAndEmployee",  // web
    CREDIT_TOTALS = "creditTotals",
    CREDIT_SUMMARY = "creditSummary",
    CREDIT_PAYMENTS_AND_INCIDENTS = "creditPaymentsAndIncidents"
}
