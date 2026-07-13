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

const containerApp: Container = new Container();

//Service
containerApp.bind<ICreditService>(TYPES.CreditService).to(CreditService);

//Gateway
containerApp.bind<IMongoGateway>(TYPES.MongoGateway).to(MongoGateway);


//Mongo Models
containerApp.bind<IBaseMongoModel<ICredits>>(TYPES.CreditMongoModel).to(CreditMongoModel);


export { containerApp }