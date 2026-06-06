import { Container } from "inversify";
import { TYPES } from "../constant/types";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { ITransactionService } from "../repository/ITransactionService";
import { TransactionService } from "../service/TransactionService";

const containerApp: Container = new Container();

//Service
containerApp.bind<ITransactionService>(TYPES.TransactionService).to(TransactionService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

export { containerApp }