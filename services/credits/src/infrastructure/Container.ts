import { Container } from "inversify";
import { TYPES } from "../constant/types";
import { Db } from "mongodb";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { ICreditService } from "../repository/ICreditService";
import { CreditService } from "../service/CreditService";
import { IBaseMongoModel } from "../repository/IBaseMongoModel";
import { ICredits } from "../schema/mongodb/CreditsModel";
import { CreditMongoModel } from "../gateway/CreditMongoModel";
import { ICustomers } from "../schema/mongodb/Customers.Model";
import { CustomersMongoModel } from "../gateway/CutomersMongoModel";
import { ILatePaymentFeeLogs } from "../schema/mongodb/LatePaymentFeeLogs.Model";
import { LatePaymentFeeLogsMongoModel } from "../gateway/LatePaymentFeeLogsMongoModel";
import { IPayments } from "../schema/mongodb/Payments.Model";
import { PaymentsMongoModel } from "../gateway/PaymentsMongoModel";
import { IWallets } from "../schema/mongodb/Wallets.Model";
import { WalletsMongoModel } from "../gateway/WalletsMongoModel";

const containerApp: Container = new Container();

//Service
containerApp.bind<ICreditService>(TYPES.CreditService).to(CreditService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);


//Mongo Models
containerApp.bind<IBaseMongoModel<ICredits>>(TYPES.CreditMongoModel).to(CreditMongoModel);
containerApp.bind<IBaseMongoModel<ICustomers>>(TYPES.CustomersMongoModel).to(CustomersMongoModel);
containerApp.bind<IBaseMongoModel<ILatePaymentFeeLogs>>(TYPES.LatePaymentFeeLogsMongoModel).to(LatePaymentFeeLogsMongoModel);
containerApp.bind<IBaseMongoModel<IPayments>>(TYPES.PaymentsMongoModel).to(PaymentsMongoModel);
containerApp.bind<IBaseMongoModel<IWallets>>(TYPES.WalletsMongoModel).to(WalletsMongoModel);





export { containerApp }