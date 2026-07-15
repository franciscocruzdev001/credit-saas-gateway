import { injectable } from "inversify";
import { BaseMongoModel } from "./BaseMongoModel";
import { ChargeReportLogsModel, IChargeReportLogs } from "../schema/mongodb/models/ChargeReportLogsModel";

@injectable()
export class ChargeReportLogsMongoModel extends BaseMongoModel<IChargeReportLogs> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(ChargeReportLogsModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}