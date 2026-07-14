import { injectable } from "inversify";
import { CreditsModel, ICredits } from "../schema/mongodb/models/CreditsModel";
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class CreditMongoModel extends BaseMongoModel<ICredits> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(CreditsModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}