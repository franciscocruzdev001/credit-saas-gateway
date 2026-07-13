export type typeSymbol = {
    CreditService: symbol;
    MongoGateway: symbol;
    CreditMongoModel: symbol;
    CustomersMongoModel: symbol;
    LatePaymentFeeLogsMongoModel: symbol;
    PaymentsMongoModel: symbol;
    WalletsMongoModel: symbol;


}

export const TYPES: typeSymbol = {
    CreditService: Symbol.for("CreditService"),
    MongoGateway: Symbol.for("MongoGateway"),
    CreditMongoModel: Symbol.for("CreditMongoModel"),
    CustomersMongoModel: Symbol.for("CustomersMongoModel"),
    LatePaymentFeeLogsMongoModel: Symbol.for("latePaymentFeeLogsMongoModel"),
    PaymentsMongoModel: Symbol.for("PaymentsMongoModel"),
    WalletsMongoModel: Symbol.for("WalletsMongoModel")

}