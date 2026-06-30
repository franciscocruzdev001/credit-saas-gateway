import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { firstValueFrom, map, Observable } from "rxjs";
import { ITransactionService } from "../repository/ITransactionService";
import { SearchTransactionsRequest } from "../types/SearchTransactionsRequest";

export const transactionRouter: Router = Router();
const transactionService = containerApp.get<ITransactionService>(TYPES.TransactionService);

// POST endpoint with explicit types for parameters
transactionRouter.post("/SearchTransactions", async (req: Request<SearchTransactionsRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
  try {
    console.log("/searchCredits-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = transactionService.searchTransactions(req.body);

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