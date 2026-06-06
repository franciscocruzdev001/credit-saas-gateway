import { Container } from "inversify";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { TYPES } from "../constant/types";
import { AuthorizerService } from "../service/AuthorizerService";
import { Db } from "mongodb";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";

const containerApp: Container = new Container();

//Service
containerApp.bind<IAuthorizerService>(TYPES.AuthorizerService).to(AuthorizerService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

export { containerApp }