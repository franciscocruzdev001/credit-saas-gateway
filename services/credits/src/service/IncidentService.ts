import { inject, injectable } from "inversify";
import { map, mergeMap, Observable, of } from "rxjs";
import { QueryFilter } from "mongoose";
import { ICredits } from "../schema/mongodb/models/CreditsModel";
import { CreditStatusEnum } from "../infrastructure/CreditStatusEnum";
import { TransactionStatusEnum } from "../infrastructure/TransactionStatusEnum";
import { TYPES } from "../constant/types";
import { IIncidentService } from "../repository/IIncidentService";
import { ILoggerGateway } from "../repository/ILoggerGateway";
import { CreditMongoModel } from "../gateway/CreditMongoModel";
import { PaymentsMongoModel } from "../gateway/PaymentsMongoModel";
import { LatePaymentFeeLogsMongoModel } from "../gateway/LatePaymentFeeLogsMongoModel";
import { IncidentsMongoModel } from "../gateway/IncidentsBaseMongoModel";

@injectable()
export class IncidentService implements IIncidentService {
    private readonly _logger: ILoggerGateway;
    private readonly _creditMongoModel: CreditMongoModel;
    private readonly _paymentsMongoModel: PaymentsMongoModel;
    private readonly _latePaymentFeeLogsMongoModel: LatePaymentFeeLogsMongoModel;
    private readonly _incidentsMongoModel: IncidentsMongoModel;

    constructor(
        @inject(TYPES.LoggerGateway) logger: ILoggerGateway,
        @inject(TYPES.CreditMongoModel) creditMongoModel: CreditMongoModel,
        @inject(TYPES.PaymentsMongoModel) paymentsMongoModel: PaymentsMongoModel,
        @inject(TYPES.LatePaymentFeeLogsMongoModel) latePaymentFeeLogsMongoModel: LatePaymentFeeLogsMongoModel,
        @inject(TYPES.IncidentsMongoModel) incidentsMongoModel: IncidentsMongoModel
    ) {
        this._logger = logger;
        this._creditMongoModel = creditMongoModel;
        this._paymentsMongoModel = paymentsMongoModel;
        this._latePaymentFeeLogsMongoModel = latePaymentFeeLogsMongoModel;
        this._incidentsMongoModel = incidentsMongoModel;
    }

    public registerDailyIncidents(consultDate: Date): Observable<Object> {
        return of(1).pipe(
            mergeMap(() =>
                this._creditMongoModel.findDocuments(
                    this._buildFiltersCreditsWithoutRecentPayment(consultDate)
                )
            ),
            map((dataResponse: { documents: ICredits[], totalDocuments: number }) => {
                console.log("registerDailyIncidents - consultDate:", consultDate.toISOString());
                console.log("registerDailyIncidents - créditos encontrados:", dataResponse.totalDocuments);
                return {
                    total: dataResponse.totalDocuments,
                    records: dataResponse.documents
                };
            })
        );
    }

    // Créditos de todas las empresas en proceso de cobro, aprobados, cuyo
    // último pago aprobado es anterior a la fecha consultada.
    private _buildFiltersCreditsWithoutRecentPayment(consultDate: Date): QueryFilter<ICredits> {
        return {
            status: CreditStatusEnum.CHARGE_PROCESS,
            transactionStatus: TransactionStatusEnum.APPROVED,
            lastPaymentDateApproved: { $lt: consultDate }
        };
    }
}
