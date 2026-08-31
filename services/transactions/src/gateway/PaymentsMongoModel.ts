import { injectable } from "inversify";
import { PaymentsModel, IPayments } from "../schema/mongodb/models/Payments.Model";
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class PaymentsMongoModel extends BaseMongoModel<IPayments> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(PaymentsModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}