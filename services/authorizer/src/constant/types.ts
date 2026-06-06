export type typeSymbol = {
    AuthorizerService: symbol;
    MongoGateway: symbol;
}

export const TYPES: typeSymbol = {
    AuthorizerService: Symbol.for("AuthorizerService"),
    MongoGateway: Symbol.for("MongoGateway")
}