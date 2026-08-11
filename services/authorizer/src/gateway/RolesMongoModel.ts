import { injectable } from "inversify";
import { RolesModel, IRoles } from "../schema/mongodb/models/RolesModel";
import { BaseMongoModel } from "./BaseMongoModel";

@injectable()
export class RolesMongoModel extends BaseMongoModel<IRoles> {
    constructor() {
        // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
        super(RolesModel);
    }
}