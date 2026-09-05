import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { firstValueFrom, map, Observable } from "rxjs";
import { Users } from "../types/Users";
import { ChargeReportLogs } from "../types/ChargeReportLogs";
import { SearchEmployeesRequest } from "../types/SearchEmployeesRequest";
import { LoginRequest } from "../types/LoginRequest";
import { LoginResponse } from "../types/LoginResponse";
import { authMiddleware, type AuthenticatedRequest } from "../infrastructure/AuthMiddleware";
import { requirePermission } from "../infrastructure/RequirePermission";
import { PermissionsEnum } from "../constant/PermissionsEnum";
import { AuthorizationContext } from "../types/AuthorizationContext";

export const authRouter: Router = Router();

const authorizerService = containerApp.get<IAuthorizerService>(TYPES.AuthorizerService);

// GET endpoint with explicit types for parameters
authRouter.get("/auth", async (req: Request, res: Response) => {
  //const result = authorizerService.authorization();
  //res.json({ message: "Fetch all users", result:  `${result}`});
  try {
    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = authorizerService.test();

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

// POST endpoint with explicit types for parameters
authRouter.post("/createUser", async (req: Request<Users>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

    console.log("/createUser-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = authorizerService.createUser(req.body);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'create user', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /createUser:", error);
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});


// POST endpoint with explicit types for parameters
authRouter.post("/createChargeReportLogs", async (req: Request<ChargeReportLogs>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

    console.log("/createChargeReportLogs-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = authorizerService.createChargeReportLogs(req.body);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /createChargeReportLogs:", error);
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});


// POST endpoint with explicit types for parameters
// Sin authMiddleware a propósito: crear una empresa acreedora es el paso
// inicial (bootstrap) antes de que exista cualquier usuario/token para esa
// empresa. authorizationContext no se usa dentro del service para este método.
authRouter.post("/createCreditorCompanies", async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

    console.log("/createCreditorCompanies-req.body: ", req.body);

    const authorizationContext: AuthorizationContext = {
      userId: req.user?.userId ?? '',
      creditorCompanyId: req.user?.creditorCompanyId ?? '',
      roles: req.user?.roles ?? [],
    };

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = authorizerService.createCreditorCompanies(req.body, authorizationContext);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /createCreditorCompanies:", error);
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});



// POST endpoint with explicit types for parameters
authRouter.post("/searchEmployees", authMiddleware , requirePermission(PermissionsEnum.USERS_READ), async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

    console.log("/searchEmployees-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = authorizerService.searchEmployees(req.body);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

// POST endpoint: valida credenciales y regresa un JWT + datos básicos del usuario
authRouter.post("/login", async (req: Request<LoginRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) {
    res.status(400).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
    return;
  }

  try {
    console.log("/login-req.body: ", { email: req.body.email }); // nunca loguear el password

    // 1. Llama al método que devuelve el Observable
    const result: Observable<LoginResponse> = authorizerService.authorizer(req.body);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Login exitoso', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /login:", error);
    // Credenciales inválidas o usuario inactivo -> 401, no 500
    res.status(401).json({ error: (error as Error).message || 'Credenciales inválidas' });
  }
});


//authRouter.get("/auth", authorizerService.authorization);
authRouter.get("/testakjshfdjkhasjhd", authorizerService.test);