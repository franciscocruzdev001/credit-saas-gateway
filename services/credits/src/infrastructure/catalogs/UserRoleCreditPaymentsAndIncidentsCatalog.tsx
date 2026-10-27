import { QueryFilter, Types } from "mongoose";
import { get } from "lodash";
import { UserRoleEnum } from "../UserRoleEnum";
import { ICredits } from "../../schema/mongodb/models/CreditsModel";
import { AuthorizationContext } from "../../types/AuthorizationContext";
import { GetCreditPaymentsAndIncidentsRequest } from "../../types/GetCreditPaymentsAndIncidentsRequest";

// Filtro del crédito para su historial (getCreditPaymentsAndIncidents): el
// crédito solicitado, siempre dentro de la empresa del JWT.
export const UserRoleCreditPaymentsAndIncidentsCatalog: Record<string, (
    request: GetCreditPaymentsAndIncidentsRequest,
    authorizationContext: AuthorizationContext
) => QueryFilter<ICredits>> = {
    [UserRoleEnum.MANAGER]: (request: GetCreditPaymentsAndIncidentsRequest, authorizationContext: AuthorizationContext) => ({
        _id: new Types.ObjectId(get(request, "creditId", "000000000000000000000000")),
        creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
    }),
    [UserRoleEnum.CREDIT_COLLECTOR]: (request: GetCreditPaymentsAndIncidentsRequest, authorizationContext: AuthorizationContext) => ({
        // CREDIT_COLLECTOR: solo sus propios créditos (userId del JWT)
        _id: new Types.ObjectId(get(request, "creditId", "000000000000000000000000")),
        creditorCompanyId: new Types.ObjectId(get(authorizationContext, "creditorCompanyId", "000000000000000000000000")),
        userId: new Types.ObjectId(get(authorizationContext, "userId", "000000000000000000000000")),
    })
}

// ADMIN reutiliza el mismo filtro que MANAGER (visibilidad total de la empresa)
UserRoleCreditPaymentsAndIncidentsCatalog[UserRoleEnum.ADMIN] = UserRoleCreditPaymentsAndIncidentsCatalog[UserRoleEnum.MANAGER]!;
