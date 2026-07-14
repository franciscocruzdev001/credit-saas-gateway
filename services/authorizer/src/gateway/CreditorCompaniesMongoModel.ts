import { injectable } from "inversify";
import { CreditorCompaniesModel, ICreditorCompanies } from "../schema/mongodb/models/CreditorCompaniesModel"
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class CreditorCompaniesMongoModel extends BaseMongoModel<ICreditorCompanies> {
    constructor() {
        // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
        super(CreditorCompaniesModel);
    }
    // Aquí puedes añadir métodos específicos que solo pertenezcan a User
    /*public async findByEmail(email: string): Promise<IUserDocument | null> {
      return this.model.findOne({ email }).exec();
    }*/
}