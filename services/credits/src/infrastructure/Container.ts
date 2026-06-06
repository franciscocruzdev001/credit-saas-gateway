import { Container } from "inversify";
import { TYPES } from "../constant/types";
import { Db } from "mongodb";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { ICreditService } from "../repository/ICreditService";
import { CreditService } from "../service/CreditService";

const containerApp: Container = new Container();

//Service
containerApp.bind<ICreditService>(TYPES.CreditService).to(CreditService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

export { containerApp }