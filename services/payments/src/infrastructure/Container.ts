import { Container } from "inversify";
import { TYPES } from "../constant/types";
import { Db } from "mongodb";
import { IMongoGateway } from "../repository/IMongoGateway";
import { MongoGateway } from "../gateway/MongoGateway";
import { IPaymentService } from "../repository/IPaymentService";
import { PaymentService } from "../service/PaymentService";

const containerApp: Container = new Container();

//Service
containerApp.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);

export { containerApp }