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
import { IBaseMongoModel } from "../repository/IBaseMongoModel";
import { IUsers } from "../schema/mongodb/models/UsersModel";
import { ICreditorCompanies } from "../schema/mongodb/models/CreditorCompaniesModel";
import { IChargeReportLogs } from "../schema/mongodb/models/ChargeReportLogsModel";

const containerApp: Container = new Container();

//Service
containerApp.bind<IAuthorizerService>(TYPES.AuthorizerService).to(AuthorizerService);

//MongoModels
containerApp.bind<IBaseMongoModel<IChargeReportLogs>>(TYPES.ChargeReportLogsMongoModel).to(ChargeReportLogsMongoModel);
containerApp.bind<IBaseMongoModel<ICreditorCompanies>>(TYPES.CreditorCompaniesMongoModel).to(CreditorCompaniesMongoModel);
containerApp.bind<IBaseMongoModel<IUsers>>(TYPES.UsersMongoModel).to(UsersMongoModel);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

export { containerApp }