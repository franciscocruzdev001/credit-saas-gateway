import { map, mergeMap, Observable, of } from "rxjs";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document } from 'mongodb';
import { Users } from "../types/Users";
import { UsersMongoModel } from "../gateway/UsersMongoModel";
import { IUsers } from "../schema/mongodb/models/UsersModel";
import { Types } from "mongoose";
import { get } from "lodash";
import { UserStatusEnum } from "../infrastructure/UserStatusEnum";
import { ChargeReportLogs } from "../types/ChargeReportLogs";
import { IChargeReportLogs } from "../schema/mongodb/models/ChargeReportLogsModel";
import { ChargeReportLogsMongoModel } from "../gateway/ChargeReportLogsMongoModel";
import { CreditorCompaniesMongoModel } from "../gateway/CreditorCompaniesMongoModel";
import { ICreditorCompanies } from "../schema/mongodb/models/CreditorCompaniesModel";
import { CreditorCompanies } from "../types/CreditorCompanies";

@injectable()
export class AuthorizerService implements IAuthorizerService {
    private readonly _mongodb: IMongoGateway;
    private readonly _usersMongoModel: UsersMongoModel;
    private readonly _chargereportlogsMongoModel: ChargeReportLogsMongoModel;
    private readonly _creditorcompaniesMongoModel: CreditorCompaniesMongoModel;



    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.UsersMongoModel) usersMongoModel: UsersMongoModel,
        @inject(TYPES.ChargeReportLogsMongoModel) ChargeReportLogsMongoModel: ChargeReportLogsMongoModel,
        @inject(TYPES.CreditorCompaniesMongoModel) CreditorCompaniesMongoModel: CreditorCompaniesMongoModel
    ) {
        this._mongodb = mongodb;
        this._usersMongoModel = usersMongoModel;
        this._chargereportlogsMongoModel = ChargeReportLogsMongoModel;
        this._creditorcompaniesMongoModel = CreditorCompaniesMongoModel;
    }


    public authorization(): Observable<boolean> {
        return of(1).pipe(
            map(() => true)
        );
    }

    public test(): Observable<Object> {
        const dbName: string = "admin";
        const collectionName: string = "prueba";
        return of(1).pipe(
            mergeMap(() =>
                this._mongodb.findAllDocuments(dbName, collectionName)
            ),
            map((documents: Document[]) => ({
                total: documents.length,
                records: documents
            }))
        );
    }

    public createUser(userData: Users): Observable<boolean> {
        const userModelInfo: IUsers = {
            createdAt: new Date(),
            updatedAt: new Date(),
            userName: get(userData, "userName", ""),
            email: get(userData, "email", ""),
            password: get(userData, "email", ""),
            roles: get(userData, "roles", []),
            status: get(userData, "status", UserStatusEnum.ACTIVE) as UserStatusEnum,
            creditorCompanyId: new Types.ObjectId(get(userData, "creditorCompanyId", ""))
        }

        return of(1).pipe(
            mergeMap(() =>
                this._usersMongoModel.create(userModelInfo)
            )
        );
    }
    public createChargeReportLogs(chargeReportLogsData: ChargeReportLogs): Observable<boolean> {
        const chargeReportLogsModelInfo: IChargeReportLogs = {
            createdAt: new Date(),
            updatedAt: new Date(),
            chargeFrequency: get(chargeReportLogsData, "chargeFrequency", ""),
            amountCharged: get(chargeReportLogsData, "amountCharged", 0),
            amountReceivable: get(chargeReportLogsData, "amountReceivable", 0),
            approvedTrasactions: get(chargeReportLogsData, "approvedTrasactions", 0),
            creditorCompanyId: new Types.ObjectId(get(chargeReportLogsData, "creditorCompanyId", "")),
            userId: new Types.ObjectId(get(chargeReportLogsData, "userId", ""))
        }

        return of(1).pipe(
            mergeMap(() =>
                this._chargereportlogsMongoModel.create(chargeReportLogsModelInfo)
            )
        );
    }
    public createCreditorCompanies(creditorCompaniesData: CreditorCompanies): Observable<boolean> {
        const creditorCompaniesModelInfo: ICreditorCompanies = {
            createdAt: new Date(),
            updatedAt: new Date(),
            companyName: get(creditorCompaniesData, "companyName", ""),
            socialReason: get(creditorCompaniesData, "socialReason", ""),
            phoneNumber: get(creditorCompaniesData, "phoneNumber", ""),
            email: get(creditorCompaniesData, "email", ""),
            chargeRules: get(creditorCompaniesData, "chargeRules", []).map((rule) => ({
                chargeFrequency: get(rule, "chargeFrequency", ""),
                chargePeriods: get(rule, "chargePeriods", 0),
                renovationPeriod: get(rule, "renovationPeriod", 0),
                comissionRate: get(rule, "comissionRate", 0)
            })) as ICreditorCompanies["chargeRules"]
        }

        return of(1).pipe(
            mergeMap(() =>
                this._creditorcompaniesMongoModel.create(creditorCompaniesModelInfo)
            )
        );
    }
}