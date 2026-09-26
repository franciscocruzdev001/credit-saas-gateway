import { injectable } from "inversify";
import { UsersModel, IUsers } from "../schema/mongodb/models/UsersModel"
import { BaseMongoModel } from "./BaseMongoModel";
import { map, mergeMap, Observable, of } from "rxjs";
import { PipelineStage, QueryFilter, QueryOptions } from "mongoose";
import { defaultTo, get } from "lodash";
import { CollectionNameEnum } from "../infrastructure/CollectionNameEnum";
import { Document } from "mongodb";

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

    public findEmployeesJoinWallet(
        employeeFilters: QueryFilter<IUsers>,
        pagination: QueryOptions
    ): Observable<{
        documents: Document[],
        totalDocuments: number
    }> {
        return of(true).pipe(
            mergeMap(() => this.model.aggregate(this._buildPipelineToWallet(employeeFilters, pagination))),
            map((result: any[]) => ({
                documents: get(result, "[0].data", []),
                totalDocuments: get(result, "[0].totalCount[0].count", 0)
            }))
        );
    }

    private _buildPipelineToWallet(
        employeeFilters: QueryFilter<IUsers>,
        pagination: QueryOptions
    ): PipelineStage[] {
        return [
            { $match: employeeFilters },
            {
                $lookup: {
                    from: CollectionNameEnum.WALLETS,
                    let: { employeeId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userId", "$$employeeId"] } } },
                        { $project: { _id: 1, accountNumber: 1 } }
                    ],
                    as: "walletInfo"
                }
            },
            { $unwind: { path: "$walletInfo", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userName: 1,
                    email: 1,
                    status: 1,
                    contact: 1,
                    creditorCompanyId: 1,
                    walletId: "$walletInfo._id",
                    accountNumber: "$walletInfo.accountNumber"
                }
            },
            {
                $facet: {
                    data: [{ $skip: defaultTo(pagination.skip, 0) }, { $limit: defaultTo(pagination.limit, 0) }],
                    totalCount: [{ $count: 'count' }],
                },
            }
        ];
    }
}
