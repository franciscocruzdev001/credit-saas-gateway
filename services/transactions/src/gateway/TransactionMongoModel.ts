import { injectable } from "inversify";
import { TransactionsModel, ITransactions } from "../schema/mongodb/models/TransactionsModel";
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class TransactionMongoModel extends BaseMongoModel<ITransactions> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(TransactionsModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}