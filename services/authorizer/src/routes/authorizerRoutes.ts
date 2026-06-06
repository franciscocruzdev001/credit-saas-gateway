import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { IAuthorizerService } from "../repository/IAuthorizerService";
import { firstValueFrom, map, Observable } from "rxjs";

export const authRouter: Router = Router();
const authorizerService = containerApp.get<IAuthorizerService>(TYPES.AuthorizerService);

// GET endpoint with explicit types for parameters
authRouter.get("/auth", async (req: Request, res: Response) => {
  //const result = authorizerService.authorization();
  //res.json({ message: "Fetch all users", result:  `${result}`});
  try{
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
  }catch(error){
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

//authRouter.get("/auth", authorizerService.authorization);
authRouter.get("/testakjshfdjkhasjhd", authorizerService.test);