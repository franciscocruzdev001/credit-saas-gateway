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

@injectable()
export class AuthorizerService implements IAuthorizerService {
    private readonly _mongodb: IMongoGateway;
    private readonly _usersMongoModel: UsersMongoModel;


    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.UsersMongoModel) usersMongoModel: UsersMongoModel
    ) {
        this._mongodb = mongodb;
        this._usersMongoModel = usersMongoModel;
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
}