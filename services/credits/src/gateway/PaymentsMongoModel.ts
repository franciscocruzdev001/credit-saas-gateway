import { inject, injectable } from "inversify";
import { PaymentsModel, IPayments } from "../schema/mongodb/models/Payments.Model";
import { BaseMongoModel } from "./BaseMongoModel";
import { TYPES } from "../constant/types";
import { ILoggerGateway } from "../repository/ILoggerGateway";

@injectable()
export class PaymentsMongoModel extends BaseMongoModel<IPayments> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(PaymentsModel,logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}