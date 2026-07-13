export type typeSymbol = {
    AuthorizerService: symbol;
    MongoGateway: symbol;
    ChargeReportLogsMongoModel: symbol;
    CreditorCompaniesMongoModel: symbol;
    UsersMongoModel: symbol;
}

export const TYPES: typeSymbol = {
    AuthorizerService: Symbol.for("AuthorizerService"),
    MongoGateway: Symbol.for("MongoGateway"),
    ChargeReportLogsMongoModel: Symbol.for("ChargeReportLogsMongoModel"),
    CreditorCompaniesMongoModel: Symbol.for("CreditorCompaniesMongoModel"),
    UsersMongoModel: Symbol.for("UsersMongoModel")
}