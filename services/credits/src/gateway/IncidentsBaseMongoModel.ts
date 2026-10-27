import { inject, injectable } from "inversify";
import { IncidentsModel, IIncidents } from "../schema/mongodb/models/IncidentsModel";
import { BaseMongoModel } from "./BaseMongoModel";
import { TYPES } from "../constant/types";
import { ILoggerGateway } from "../repository/ILoggerGateway";

@injectable()
export class IncidentsMongoModel extends BaseMongoModel<IIncidents> {
  constructor(@inject(TYPES.LoggerGateway) logger: ILoggerGateway) {
    // Inyectamos explícitamente el modelo Mongoose de manera estática a la clase superior
    super(IncidentsModel, logger);
  }
}
