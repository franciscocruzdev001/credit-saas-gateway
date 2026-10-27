export type typeSymbol = {
    CreditService: symbol;
    IncidentService: symbol;
    MongoGateway: symbol;
    LoggerGateway: symbol;
    CreditMongoModel: symbol;
    CustomersMongoModel: symbol;
    LatePaymentFeeLogsMongoModel: symbol;
    IncidentsMongoModel: symbol;
    PaymentsMongoModel: symbol;
    WalletsMongoModel: symbol;
    TransactionMongoModel: symbol;
}

export const TYPES: typeSymbol = {
    CreditService: Symbol.for("CreditService"),
    IncidentService: Symbol.for("IncidentService"),
    MongoGateway: Symbol.for("MongoGateway"),
    LoggerGateway: Symbol.for("LoggerGateway"),
    CreditMongoModel: Symbol.for("CreditMongoModel"),
    CustomersMongoModel: Symbol.for("CustomersMongoModel"),
    LatePaymentFeeLogsMongoModel: Symbol.for("latePaymentFeeLogsMongoModel"),
    IncidentsMongoModel: Symbol.for("IncidentsMongoModel"),
    PaymentsMongoModel: Symbol.for("PaymentsMongoModel"),
    WalletsMongoModel: Symbol.for("WalletsMongoModel"),
    TransactionMongoModel: Symbol.for("TransactionMongoModel")
}