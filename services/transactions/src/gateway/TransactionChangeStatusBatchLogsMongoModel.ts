import { inject, injectable } from "inversify";
import { BaseMongoModel } from "./BaseMongoModel";
import { ITransactionChangeStatusBatchLogs, TransactionChangeStatusBatchModel } from "../schema/mongodb/models/TransactionChangeStatusBatchLogsModel";
import { TYPES } from "../constant/types";
import { ILoggerGateway } from "../repository/ILoggerGateway";

@injectable()
export class TransactionChangeStatusBatchLogsMongoModel extends BaseMongoModel<ITransactionChangeStatusBatchLogs> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(TransactionChangeStatusBatchModel,logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}