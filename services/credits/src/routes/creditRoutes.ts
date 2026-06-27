import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { firstValueFrom, map, Observable } from "rxjs";
import { ICreditService } from "../repository/ICreditService";
import { SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { SearchEmployeesRequest } from "../types/SearchEmployeesRequest";

export const creditRouter: Router = Router();
const creditService = containerApp.get<ICreditService>(TYPES.CreditService);


// GET endpoint with explicit types for parameters
creditRouter.get("/listCredits", async (req: Request, res: Response) => {
  try{
    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = creditService.searchCredits();

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

// POST endpoint with explicit types for parameters
creditRouter.post("/searchCustomers", async ( req: Request <SearchCustomersRequest> , res: Response) => {

  if( req.body === undefined || req.body == null)  res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
    
  try{

    console.log("/searchCustomers-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = creditService.searchCustomer(req.body);

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


// POST endpoint with explicit types for parameters
creditRouter.post("/searchEmployees", async ( req: Request <SearchEmployeesRequest> , res: Response) => {

  if( req.body === undefined || req.body == null)  res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
    
  try{

    console.log("/searchEmployees-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = creditService.searchEmployees(req.body);

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





