export type typeSymbol = {
    TransactionService: symbol;
    MongoGateway: symbol;
    TransactionMongoModel: symbol;
    WalletsMongoModel: symbol;
    CreditMongoModel: symbol;
    PaymentsMongoModel: symbol;
    TransactionChangeStatusBatchLogsMongoModel: symbol;
}

export const TYPES: typeSymbol = {
    TransactionService: Symbol.for("TransactionService"),
    MongoGateway: Symbol.for("MongoGateway"),
    TransactionMongoModel: Symbol.for("TransactionMongoModel"),
    WalletsMongoModel: Symbol.for("WalletsMongoModel"),
    CreditMongoModel: Symbol.for("CreditMongoModel"),
    PaymentsMongoModel: Symbol.for("PaymentsMongoModel"),
    TransactionChangeStatusBatchLogsMongoModel: Symbol.for("TransactionChangeStatusBatchLogsMongoModel")
}