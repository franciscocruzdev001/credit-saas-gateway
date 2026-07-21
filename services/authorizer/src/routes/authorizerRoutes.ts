import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { firstValueFrom, map, Observable } from "rxjs";
import { Users } from "../types/Users";
import { ChargeReportLogs } from "../types/ChargeReportLogs";
import { CreditorCompanies } from "../types/CreditorCompanies";

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
authRouter.post("/createCreditorCompanies", async (req: Request<CreditorCompanies>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

    console.log("/createCreditorCompanies-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = authorizerService.createUser(req.body);

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


//authRouter.get("/auth", authorizerService.authorization);
authRouter.get("/testakjshfdjkhasjhd", authorizerService.test);