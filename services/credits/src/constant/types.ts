export type typeSymbol = {
    CreditService: symbol;
    MongoGateway: symbol;
    CreditMongoModel: symbol;
}

export const TYPES: typeSymbol = {
    CreditService: Symbol.for("CreditService"),
    MongoGateway: Symbol.for("MongoGateway"),
    CreditMongoModel: Symbol.for("CreditMongoModel"),
}