import { Container } from "inversify";
import { TYPES } from "../constant/types";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { ITransactionService } from "../repository/ITransactionService";
import { TransactionService } from "../service/TransactionService";
import { IBaseMongoModel } from "../repository/IBaseMongoModel";
import { ITransactions } from "../schema/mongodb/models/TransactionsModel"
import { TransactionMongoModel } from "../gateway/TransactionMongoModel";
import { IWallets } from "../schema/mongodb/models/Wallets.Model";
import { WalletsMongoModel } from "../gateway/WalletsMongoModel";

const containerApp: Container = new Container();

//Service
containerApp.bind<ITransactionService>(TYPES.TransactionService).to(TransactionService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

//Mongo Models
containerApp.bind<IBaseMongoModel<ITransactions>>(TYPES.TransactionMongoModel).to(TransactionMongoModel);
containerApp.bind<IBaseMongoModel<IWallets>>(TYPES.WalletsMongoModel).to(WalletsMongoModel);

export { containerApp }