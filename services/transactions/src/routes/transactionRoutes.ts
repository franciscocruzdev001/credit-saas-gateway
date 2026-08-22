import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { firstValueFrom, map, Observable } from "rxjs";
import { ITransactionService } from "../repository/ITransactionService";
import { SearchTransactionsRequest } from "../types/SearchTransactionsRequest";
import { SearchTransactionsByUserRequest } from "../types/SearchTransactionsByUserRequest";
import { CreateTransactionByEmployeeRequest } from "../types/CreateTransactionByEmployeeRequest";
import { AuthorizationContext } from "../types/AuthorizationContext";
import { authMiddleware, type AuthenticatedRequest } from "../infrastructure/AuthMiddleware";

export const transactionRouter: Router = Router();
const transactionService = containerApp.get<ITransactionService>(TYPES.TransactionService);

// POST endpoint searchTransactions by filter fields
transactionRouter.post("/searchTransactions", async (req: Request<SearchTransactionsRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
  try {
    console.log("/searchTransactions-req.body: ", req.body);

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

// POST endpoint searchTransactions by filter fields
transactionRouter.post("/searchTransactionsByUser", async (req: Request<SearchTransactionsByUserRequest>, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
  try {
    console.log("/searchTransactionsByUser-req.body: ", req.body);

    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = transactionService.searchTransactionsByUser(req.body);

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

// POST endpoint: crea una transacción iniciada por un empleado (nace en PENDING)
transactionRouter.post("/createTransactionByEmployee", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
  try {
    console.log("/createTransactionByEmployee-req.body: ", req.body);
    const request: CreateTransactionByEmployeeRequest = req.body;

    // 1. Llama al método que devuelve el Observable — el userId, creditorCompanyId,
    // walletId y accountNumber vienen del JWT (req.user), nunca del body
    const authorizationContext: AuthorizationContext = {
      userId: req.user?.userId ?? '',
      creditorCompanyId: req.user?.creditorCompanyId ?? '',
      ...(req.user?.walletId ? { walletId: req.user.walletId } : {}),
      ...(req.user?.accountNumber ? { accountNumber: req.user.accountNumber } : {}),
    };
    const result: Observable<boolean> = transactionService.createTransactionByEmployee(request, authorizationContext);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Transacción creada', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /createTransactionByEmployee:", error);
    // 4. Manejo de errores si el Observable falla o está vacío
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});