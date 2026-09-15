import { inject, injectable } from "inversify";
import { CustomersModel, ICustomers } from "../schema/mongodb/models/Customers.Model";
import { BaseMongoModel } from "./BaseMongoModel";
import { ILoggerGateway } from "../repository/ILoggerGateway";
import { TYPES } from "../constant/types";

@injectable()
export class CustomersMongoModel extends BaseMongoModel<ICustomers> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(CustomersModel, logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}