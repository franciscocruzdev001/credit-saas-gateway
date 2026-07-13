import { injectable } from "inversify";
import { UsersModel, IUsers } from "../schema/mongodb/UsersModel"
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class UsersMongoModel extends BaseMongoModel<IUsers> {
    constructor() {
        // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
        super(UsersModel);
    }
    // Aquí puedes añadir métodos específicos que solo pertenezcan a User
    /*public async findByEmail(email: string): Promise<IUserDocument | null> {
      return this.model.findOne({ email }).exec();
    }*/
}