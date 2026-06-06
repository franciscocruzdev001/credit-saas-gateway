export type typeSymbol = {
    TransactionService: symbol;
    MongoGateway: symbol;
}

export const TYPES: typeSymbol = {
    TransactionService: Symbol.for("TransactionService"),
    MongoGateway: Symbol.for("MongoGateway")
}