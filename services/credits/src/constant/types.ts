export type typeSymbol = {
    CreditService: symbol;
    MongoGateway: symbol;
}

export const TYPES: typeSymbol = {
    CreditService: Symbol.for("CreditService"),
    MongoGateway: Symbol.for("MongoGateway")
}