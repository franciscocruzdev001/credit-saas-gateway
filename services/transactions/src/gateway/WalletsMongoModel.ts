import { inject, injectable } from "inversify";
import { WalletsModel, IWallets } from "../schema/mongodb/models/Wallets.Model";
import { BaseMongoModel } from "./BaseMongoModel";
import { TYPES } from "../constant/types";
import { ILoggerGateway } from "../repository/ILoggerGateway";

@injectable()
export class WalletsMongoModel extends BaseMongoModel<IWallets> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(WalletsModel,logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}