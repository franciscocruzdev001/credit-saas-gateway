export type typeSymbol = {
    TransactionService: symbol;
    MongoGateway: symbol;
    TransactionMongoModel: symbol;
    WalletsMongoModel: symbol;
}

export const TYPES: typeSymbol = {
    TransactionService: Symbol.for("TransactionService"),
    MongoGateway: Symbol.for("MongoGateway"),
    TransactionMongoModel: Symbol.for("TransactionMongoModel"),
    WalletsMongoModel: Symbol.for("WalletsMongoModel")
}