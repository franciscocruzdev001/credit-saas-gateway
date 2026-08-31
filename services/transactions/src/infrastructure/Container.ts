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
import { CreditMongoModel } from "../gateway/CreditMongoModel";
import { ICredits } from "../schema/mongodb/models/CreditsModel";
import { IPayments } from "../schema/mongodb/models/Payments.Model";
import { PaymentsMongoModel } from "../gateway/PaymentsMongoModel";
import { ITransactionChangeStatusBatchLogs } from "../schema/mongodb/models/TransactionChangeStatusBatchLogsModel";
import { TransactionChangeStatusBatchLogsMongoModel } from "../gateway/TransactionChangeStatusBatchLogsMongoModel";

const containerApp: Container = new Container();

//Service
containerApp.bind<ITransactionService>(TYPES.TransactionService).to(TransactionService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

//Mongo Models
containerApp.bind<IBaseMongoModel<ITransactions>>(TYPES.TransactionMongoModel).to(TransactionMongoModel);
containerApp.bind<IBaseMongoModel<IWallets>>(TYPES.WalletsMongoModel).to(WalletsMongoModel);
containerApp.bind<IBaseMongoModel<ICredits>>(TYPES.CreditMongoModel).to(CreditMongoModel);
containerApp.bind<IBaseMongoModel<IPayments>>(TYPES.PaymentsMongoModel).to(PaymentsMongoModel);
containerApp.bind<IBaseMongoModel<ITransactionChangeStatusBatchLogs>>(TYPES.TransactionChangeStatusBatchLogsMongoModel).to(TransactionChangeStatusBatchLogsMongoModel);

export { containerApp }