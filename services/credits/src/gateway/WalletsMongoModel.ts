import { injectable } from "inversify";
import { WalletsModel, IWallets } from "../schema/mongodb/Wallets.Model";
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class WalletsMongoModel extends BaseMongoModel<IWallets> {
  constructor() {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(WalletsModel);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}