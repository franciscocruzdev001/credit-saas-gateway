import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { firstValueFrom, map, Observable } from "rxjs";
import { IPaymentService } from "../repository/IPaymentService";
import { SearchFilterPaymentsRequest } from "../types/SearchFilterPaymentsRequest";

export const paymentRouter: Router = Router();
const paymentService = containerApp.get<IPaymentService>(TYPES.PaymentService);

// GET endpoint with explicit types for parameters
paymentRouter.get("/listPayments", async (req: Request, res: Response) => {
  try {
    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = paymentService.searchPayments();

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


// GET endpoint with explicit types for parameters
paymentRouter.get("/searchCustomersPayments", async (req: Request<SearchFilterPaymentsRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
  
  try {

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = paymentService.searchFilterPayments(req.body);

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