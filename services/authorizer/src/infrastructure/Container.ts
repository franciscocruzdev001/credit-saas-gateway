import { Container } from "inversify";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { TYPES } from "../constant/types";
import { AuthorizerService } from "../service/AuthorizerService";
import { Db } from "mongodb";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { ChargeReportLogsModel } from "../schema/mongodb/ChargeReportLogsModel";
import { CreditorCompaniesModel } from "../schema/mongodb/CreditorCompaniesModel";
import { UsersModel } from "../schema/mongodb/UsersModel";

const containerApp: Container = new Container();

//Service
containerApp.bind<IAuthorizerService>(TYPES.AuthorizerService).to(AuthorizerService);

//MongoModels
containerApp.bind(TYPES.ChargeReportLogsMongoModel).to(ChargeReportLogsModel);
containerApp.bind(TYPES.CreditorCompaniesMongoModel).to(CreditorCompaniesModel);
containerApp.bind(TYPES.UsersMongoModel).to(UsersModel);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

export { containerApp }