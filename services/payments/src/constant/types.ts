export type typeSymbol = {
    PaymentService: symbol;
    MongoGateway: symbol;
}

export const TYPES: typeSymbol = {
    PaymentService: Symbol.for("PaymentService"),
    MongoGateway: Symbol.for("MongoGateway")
}