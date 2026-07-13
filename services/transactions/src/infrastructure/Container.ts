import { Container } from "inversify";
import { TYPES } from "../constant/types";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { ITransactionService } from "../repository/ITransactionService";
import { TransactionService } from "../service/TransactionService";
import { IBaseMongoModel } from "../repository/IBaseMongoModel";
import { ITransactions } from "../schema/mongodb/TransactionsModel"
import { TransactionMongoModel } from "../gateway/TransactionMongoModel";

const containerApp: Container = new Container();

//Service
containerApp.bind<ITransactionService>(TYPES.TransactionService).to(TransactionService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

//Mongo Models
containerApp.bind<IBaseMongoModel<ITransactions>>(TYPES.TransactionMongoModel).to(TransactionMongoModel);

export { containerApp }