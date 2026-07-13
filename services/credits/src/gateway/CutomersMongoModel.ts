import { injectable } from "inversify";
import { CustomersModel, ICustomers } from "../schema/mongodb/Customers.Model";
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class CustomersMongoModel extends BaseMongoModel<ICustomers> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(CustomersModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}