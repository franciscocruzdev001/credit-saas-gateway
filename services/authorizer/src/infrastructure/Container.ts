import { Container } from "inversify";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { TYPES } from "../constant/types";
import { AuthorizerService } from "../service/AuthorizerService";
import { Db } from "mongodb";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { UsersMongoModel } from "../gateway/UsersMongoModel";
import { ChargeReportLogsMongoModel } from "../gateway/ChargeReportLogsMongoModel";
import { CreditorCompaniesMongoModel } from "../gateway/CreditorCompaniesMongoModel";

const containerApp: Container = new Container();

//Service
containerApp.bind<IAuthorizerService>(TYPES.AuthorizerService).to(AuthorizerService);

//MongoModels
containerApp.bind(TYPES.ChargeReportLogsMongoModel).to(ChargeReportLogsMongoModel);
containerApp.bind(TYPES.CreditorCompaniesMongoModel).to(CreditorCompaniesMongoModel);
containerApp.bind(TYPES.UsersMongoModel).to(UsersMongoModel);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

export { containerApp }