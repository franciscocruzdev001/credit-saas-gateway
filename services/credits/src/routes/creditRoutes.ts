import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { firstValueFrom, map, Observable } from "rxjs";
import { ICreditService } from "../repository/ICreditService";
import { SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { SearchEmployeesRequest } from "../types/SearchEmployeesRequest";
import { SearchCreditsRequest } from "../types/SearchCreditsRequest";
import { SearchCreditsByEmployeeRequest } from "../types/SearchCreditsByEmployeeRequest";
import { GetPaymentRequest } from "../types/GetPaymentRequest";
import { GetWalletRequest } from "../types/GetWalletRequest";

export const creditRouter: Router = Router();
const creditService = containerApp.get<ICreditService>(TYPES.CreditService);


// POST endpoint search credits by filter fields
creditRouter.post("/searchCredits", async (req: Request<SearchCreditsRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

     console.log("/searchCredits-req.body: ", req.body);
    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = creditService.searchCredits(req.body);

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

// POST endpoint search credits by filter fields to employee
creditRouter.post("/searchCreditsByEmployee", async (req: Request<SearchCreditsByEmployeeRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

     console.log("/searchCredits-req.body: ", req.body);
    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = creditService.searchCreditsByEmployee(req.body);

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

// POST endpoint search customer by filter fields
creditRouter.post("/searchCustomers", async (req: Request<SearchCustomersRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

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
  } catch (error) {
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});


// POST endpoint: pagos de un crédito específico
creditRouter.post("/getPaymentyByCredit", async (req: Request<GetPaymentRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

    console.log("/getPaymentHistoryByCredit-req.body: ", req.body);

    const result: Observable<Object> = creditService.getPaymentByCredit(req.body);

    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /getPaymentHistoryByCredit:", error);
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});




// POST endpoint: información de la wallet (accountNumber,totalAmount)
creditRouter.post("/getWalletInfo", async (req: Request<GetWalletRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

    console.log("/getWalletInfo-req.body: ", req.body);

    const result: Observable<Object> = creditService.getWalletInfo(req.body);

    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /getWalletInfo:", error);
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});