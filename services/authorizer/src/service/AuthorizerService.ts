import { forkJoin, from, map, mergeMap, Observable, of, throwError } from "rxjs";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { inject, injectable } from "inversify";
import { IMongoGateway } from "../repository/IMongoGateway";
import { TYPES } from "../constant/types";
import { Document, Filter } from 'mongodb';
import { Users } from "../types/Users";
import { UsersMongoModel } from "../gateway/UsersMongoModel";
import { IUsers } from "../schema/mongodb/models/UsersModel";
import { QueryFilter, Types } from "mongoose";
import { get, isEmpty, isNil, isObject, isUndefined, omitBy } from "lodash";
import { UserStatusEnum } from "../infrastructure/UserStatusEnum";
import { ChargeReportLogs } from "../types/ChargeReportLogs";
import { IChargeReportLogs } from "../schema/mongodb/models/ChargeReportLogsModel";
import { ChargeReportLogsMongoModel } from "../gateway/ChargeReportLogsMongoModel";
import { CreditorCompaniesMongoModel } from "../gateway/CreditorCompaniesMongoModel";
import { ICreditorCompanies } from "../schema/mongodb/models/CreditorCompaniesModel";
import { CreditorCompanies } from "../types/CreditorCompanies";
import { FiltersItems as FilterItemsEmployees, SearchEmployeesRequest } from "../types/SearchEmployeesRequest";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { LoginResponse } from "../types/LoginResponse";
import { LoginRequest } from "../types/LoginRequest";
import { RolesMongoModel } from "../gateway/RolesMongoModel";
import { IRoles } from "../schema/mongodb/models/RolesModel";
import { WalletsMongoModel } from "../gateway/WalletsMongoModel";
import { IWallets } from "../schema/mongodb//models/Wallets.Model";
import { AuthorizationContext } from "../types/AuthorizationContext";


const SALT_ROUNDS = 10;

@injectable()
export class AuthorizerService implements IAuthorizerService {
    private readonly _mongodb: IMongoGateway;
    private readonly _usersMongoModel: UsersMongoModel;
    private readonly _chargereportlogsMongoModel: ChargeReportLogsMongoModel;
    private readonly _creditorcompaniesMongoModel: CreditorCompaniesMongoModel;
    private readonly _rolesMongoModel: RolesMongoModel;
    private readonly _walletsMongoModel: WalletsMongoModel;




    constructor(
        @inject(TYPES.MongoGateway) mongodb: IMongoGateway,
        @inject(TYPES.UsersMongoModel) usersMongoModel: UsersMongoModel,
        @inject(TYPES.ChargeReportLogsMongoModel) ChargeReportLogsMongoModel: ChargeReportLogsMongoModel,
        @inject(TYPES.CreditorCompaniesMongoModel) CreditorCompaniesMongoModel: CreditorCompaniesMongoModel,
        @inject(TYPES.RolesMongoModel) rolesMongoModel: RolesMongoModel,
        @inject(TYPES.WalletsMongoModel) walletsMongoModel: WalletsMongoModel,


    ) {
        this._mongodb = mongodb;
        this._usersMongoModel = usersMongoModel;
        this._chargereportlogsMongoModel = ChargeReportLogsMongoModel;
        this._creditorcompaniesMongoModel = CreditorCompaniesMongoModel;
        this._rolesMongoModel = rolesMongoModel;
        this._walletsMongoModel = walletsMongoModel;
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
        return of(1).pipe(
            // Hashea la contraseña en texto plano ANTES de armar el documento a
            // insertar — nunca guardamos el password original en la BD.
            mergeMap(() => from(bcrypt.hash(get(userData, "password", ""), SALT_ROUNDS))),
            mergeMap((hashedPassword: string) => {
                const roleIds: string[] = get(userData, "roles", []) as string[];
                const userModelInfo: IUsers = {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userName: get(userData, "userName", ""),
                    email: get(userData, "email", ""),
                    password: hashedPassword,
                    roles: roleIds.map((id) => new Types.ObjectId(id)),
                    status: get(userData, "status", UserStatusEnum.ACTIVE) as UserStatusEnum,
                    creditorCompanyId: new Types.ObjectId(get(userData, "creditorCompanyId", "")),
                    contact: get(userData, "contact", null)
                }

                return this._usersMongoModel.create(userModelInfo);
            })
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

    public createCreditorCompanies(creditorCompaniesData: CreditorCompanies,
        authorizationContext: AuthorizationContext):
         Observable<boolean> {
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
                ...(get(rule, "chargeDay", "") ? { chargeDay: get(rule, "chargeDay", "") } : {}),
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

    public searchEmployees(
        searchEmployeeData: SearchEmployeesRequest
    ): Observable<Object> {

        const dbName: string = "admin";
        const salto = (get(searchEmployeeData, "pagination.pageNumber", 1)) * get(searchEmployeeData, "pagination.limit", 0)

        console.log("searchCustomer-searchEmployeeData: ", searchEmployeeData);
        console.log("searchCustomer-salto: ", salto);
        return of(1).pipe(
            mergeMap(() =>
                this._usersMongoModel.findDocuments(
                    this._buildSearchFiltersByEmployees(searchEmployeeData.filtersItems),
                    {
                        skip: salto,
                        limit: get(searchEmployeeData, "pagination.limit", 0)
                    }
                )
            ),
            map((dataResponse: { documents: Document[], totalDocuments: number }) => ({
                total: dataResponse.totalDocuments,
                records: dataResponse.documents
            }))
        );
    }

    public authorizer(loginData: LoginRequest): Observable<LoginResponse> {
        const email = get(loginData, "email", "");
        const plainPassword = get(loginData, "password", "");

        return of(1).pipe(
            // 1. Busca al usuario por email — findDocuments regresa {documents, totalDocuments}
            mergeMap(() =>
                this._usersMongoModel.findDocuments(
                    { email } as QueryFilter<IUsers>,
                    { skip: 0, limit: 1 }
                )
            ),
            mergeMap((dataResponse: { documents: IUsers[], totalDocuments: number }) => {
                const userDoc = get(dataResponse, "documents.0", null) as (IUsers & { _id: Types.ObjectId }) | null;

                if (!userDoc) {
                    return throwError(() => new Error('Credenciales inválidas'));
                }
                if (userDoc.status !== UserStatusEnum.ACTIVE) {
                    return throwError(() => new Error('El usuario no está activo'));
                }

                // 2. Compara el password en texto plano contra el hash guardado
                return from(bcrypt.compare(plainPassword, userDoc.password)).pipe(
                    map((isValid: boolean) => ({ isValid, userDoc }))
                );
            }),
            mergeMap(({ isValid, userDoc }: { isValid: boolean, userDoc: IUsers & { _id: Types.ObjectId } }) => {
                if (!isValid) {
                    return throwError(() => new Error('Credenciales inválidas'));
                }

                // 3. Resuelve en paralelo: permisos (por roles), wallet (por userId)
                // e información completa de la empresa acreedora (por creditorCompanyId)
                const userRoleIds: Types.ObjectId[] = get(userDoc, "roles", []) as Types.ObjectId[];
                const creditorCompanyId = get(userDoc, "creditorCompanyId") as Types.ObjectId | undefined;

                const roles$ = isEmpty(userRoleIds)
                    ? of({ permissions: [] as string[], roleNames: [] as string[] })
                    : this._rolesMongoModel.findDocuments(
                        { _id: { $in: userRoleIds } } as unknown as QueryFilter<IRoles>,
                        { skip: 0, limit: userRoleIds.length }
                    ).pipe(
                        map((rolesResponse: { documents: IRoles[], totalDocuments: number }) => {
                            const permissions: string[] = Array.from(
                                new Set(
                                    get(rolesResponse, "documents", [])
                                        .flatMap((role) => get(role, "permissions", []))
                                )
                            ) as string[];

                            const roleNames: string[] = get(rolesResponse, "documents", [])
                                .map((role) => get(role, "name", "")) as string[];

                            return { permissions, roleNames };
                        })
                    );

                const wallet$ = this._walletsMongoModel.findDocuments(
                    { userId: userDoc._id } as unknown as QueryFilter<IWallets>,
                    { skip: 0, limit: 1 }
                ).pipe(
                    map((walletResponse: { documents: IWallets[], totalDocuments: number }) =>
                        get(walletResponse, "documents.0", null)
                    )
                );
                const creditorCompany$ = creditorCompanyId
                    ? this._creditorcompaniesMongoModel.findDocuments(
                        { _id: creditorCompanyId } as unknown as QueryFilter<ICreditorCompanies>,
                        { skip: 0, limit: 1 }
                    ).pipe(
                        map((companyResponse: { documents: ICreditorCompanies[], totalDocuments: number }) =>
                            get(companyResponse, "documents.0", null)
                        )
                    )
                    : of(null);

                return forkJoin({
                    roles: roles$,
                    wallet: wallet$,
                    creditorCompany: creditorCompany$,
                }).pipe(
                    map(({ roles, wallet, creditorCompany }) => ({
                        userDoc,
                        permissions: roles.permissions,
                        roleNames: roles.roleNames,
                        wallet,
                        creditorCompany,
                    }))
                );
            }),
            map(({ userDoc, permissions, roleNames, wallet, creditorCompany }: {
                userDoc: IUsers & { _id: Types.ObjectId },
                permissions: string[],
                roleNames: string[],
                wallet: IWallets | null,
                creditorCompany: ICreditorCompanies | null,
            }) => {
                // 4. Firma el JWT con la info mínima necesaria (nunca el password)
                const jwtSecret = get(process.env, "JWT_SECRET", "");
                const jwtExpiresIn = get(process.env, "JWT_EXPIRES_IN", "8h");
                const accountNumber = wallet?.accountNumber ?? undefined;

                const walletId = wallet?._id?.toString();

                const token = jwt.sign(
                    {
                        userId: userDoc._id.toString(),
                        email: userDoc.email,
                        roles: roleNames, // <-- nombres legibles, no ObjectIds
                        permissions,
                        creditorCompanyId: userDoc.creditorCompanyId?.toString(),
                        walletId,
                        accountNumber,

                    },
                    jwtSecret,
                    { expiresIn: jwtExpiresIn } as jwt.SignOptions
                );

                const loginResponse: LoginResponse = {
                    token,
                    user: {
                        _id: userDoc._id.toString(),
                        userName: userDoc.userName,
                        email: userDoc.email,
                        roles: roleNames,
                        permissions,
                        creditorCompanyId: userDoc.creditorCompanyId?.toString() ?? '',
                        ...(walletId ? { walletId } : {}),
                        ...(accountNumber ? { accountNumber } : {}),
                        ...(creditorCompany ? {
                            creditorCompanyInfo: {
                                _id: creditorCompany._id?.toString() ?? '',
                                companyName: creditorCompany.companyName ?? "",
                                socialReason: creditorCompany.socialReason ?? "",
                                phoneNumber: creditorCompany.phoneNumber ?? "",
                                email: creditorCompany.email ?? "",
                                chargeRules: get(creditorCompany, "chargeRules", []).map((rule) => ({
                                    chargeFrequency: rule.chargeFrequency ?? "",
                                    chargePeriods: rule.chargePeriods ?? 0,
                                    chargeDay: rule.chargeDay ?? "",
                                    renovationPeriod: rule.renovationPeriod ?? 0,
                                    comissionRate: rule.comissionRate ?? 0,
                                })),
                            }
                        } : {}),
                    },
                };

                return loginResponse;
            })
        );

    }

    private _buildSearchFiltersByEmployees(filters: FilterItemsEmployees): Filter<Document> {
        console.log("buildSearchFiltersByEmployees-filters:", filters);
        const queryFilter = {
            //status: get(searchCustomerData, "status", undefined),
            status: isEmpty(get(filters, "status", [])) ? undefined : {
                $in: get(filters, "status", []),
            },
            creditorCompanyId: new Types.ObjectId(get(filters, "creditorCompanyId", ""))
        }
        console.log("buildSearchFiltersByEmployees-queryFilter:", queryFilter);
        return omitBy(queryFilter,
            (value) => {
                return isNil(value) || isUndefined(value) || (isObject(value) && isEmpty(value));
            }
        )

    }

}
