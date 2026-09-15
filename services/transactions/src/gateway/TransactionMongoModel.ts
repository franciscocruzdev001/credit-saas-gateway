import { inject, injectable } from "inversify";
import { TransactionsModel, ITransactions } from "../schema/mongodb/models/TransactionsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { TYPES } from "../constant/types";
import { ILoggerGateway } from "../repository/ILoggerGateway";

@injectable()
export class TransactionMongoModel extends BaseMongoModel<ITransactions> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(TransactionsModel,logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}