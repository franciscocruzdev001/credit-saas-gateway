import { inject, injectable } from "inversify";
import { CreditsModel, ICredits } from "../schema/mongodb/models/CreditsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { map, mergeMap, Observable, of } from "rxjs";
import { Aggregate, PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { defaultTo, get } from "lodash";
import { ILoggerGateway } from "../repository/ILoggerGateway";
import { TYPES } from "../constant/types";

@injectable()
export class CreditMongoModel extends BaseMongoModel<ICredits> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(CreditsModel,logger);
  }
  // Aquí puedes añadir métodos específicos que solo pertenezcan a User
  /*public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }*/
}