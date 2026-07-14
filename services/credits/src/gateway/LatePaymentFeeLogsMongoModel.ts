import { injectable } from "inversify";
import { LatePaymentFeeLogsModel, ILatePaymentFeeLogs } from "../schema/mongodb/models/LatePaymentFeeLogs.Model";
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class LatePaymentFeeLogsMongoModel extends BaseMongoModel<ILatePaymentFeeLogs> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(LatePaymentFeeLogsModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}