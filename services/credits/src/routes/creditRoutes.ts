import { Router, Request, Response } from "express";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { firstValueFrom, map, Observable } from "rxjs";
import { ICreditService } from "../repository/ICreditService";
import { SearchCustomersRequest } from "../types/SearchCustomersRequest";
import { SearchCustomersByEmployeeRequest } from "../types/SearchCustomersByEmployeeRequest";
import { SearchEmployeesRequest } from "../types/SearchEmployeesRequest";
import { SearchCreditsRequest } from "../types/SearchCreditsRequest";
import { SearchCreditsByEmployeeRequest } from "../types/SearchCreditsByEmployeeRequest";
import { GetPaymentRequest } from "../types/GetPaymentRequest";
import { GetWalletRequest } from "../types/GetWalletRequest";
import { Customers } from "../types/Customers";
import { Credits } from "../types/Credits";
import { Payments } from "../types/Payments";
import { AuthorizationContext } from "../types/AuthorizationContext";
import { GetCreditTotalsRequest } from "../types/GetCreditTotalsRequest";
import { authMiddleware, type AuthenticatedRequest } from "../infrastructure/AuthMiddleware";

export const creditRouter: Router = Router();
const creditService = containerApp.get<ICreditService>(TYPES.CreditService);


// POST endpoint: crea un crédito para un cliente (nuevo o existente) a nombre del empleado autenticado
creditRouter.post("/createCreditsByEmployee", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) {
    res.status(400).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
    return;
  }

  try {

    console.log("/createCreditsByEmployee-req.body: ", req.body);
    const request: { customer?: Customers, credit: Credits } = req.body;

    // 1. Llama al método que devuelve el Observable — el userId, creditorCompanyId,
    // walletId y accountNumber vienen del JWT (req.user), nunca del body
    const authorizationContext: AuthorizationContext = {
      userId: req.user?.userId ?? '',
      creditorCompanyId: req.user?.creditorCompanyId ?? '',
      ...(req.user?.walletId ? { walletId: req.user.walletId } : {}),
      ...(req.user?.accountNumber ? { accountNumber: req.user.accountNumber } : {}),
    };
    const result: Observable<boolean> = creditService.createCreditsByEmployee(request, authorizationContext);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Crédito creado', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /createCreditsByEmployee:", error);
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

// POST endpoint: crea un pago sobre un crédito a nombre del empleado autenticado
creditRouter.post("/createPaymentsByEmployee", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) {
    res.status(400).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
    return;
  }

  try {

    console.log("/createPaymentsByEmployee-req.body: ", req.body);
    const request: Payments = req.body;

    // 1. Llama al método que devuelve el Observable — el userId, creditorCompanyId,
    // walletId y accountNumber vienen del JWT (req.user), nunca del body
    const authorizationContext: AuthorizationContext = {
      userId: req.user?.userId ?? '',
      creditorCompanyId: req.user?.creditorCompanyId ?? '',
      ...(req.user?.walletId ? { walletId: req.user.walletId } : {}),
      ...(req.user?.accountNumber ? { accountNumber: req.user.accountNumber } : {}),
    };
    const result: Observable<boolean> = creditService.createPaymentsByEmployee(request, authorizationContext);

    // 2. Convierte el Observable a Promesa y espera el primer valor emitido
    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Pago creado', data: respuesta }))
      )
    );

    // 3. Envía la respuesta al cliente
    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /createPaymentsByEmployee:", error);
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

// POST endpoint: totales de créditos (por cobrar/cobrado/pendiente) agrupados por frecuencia
creditRouter.post("/getCreditTotals", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) {
    res.status(400).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
    return;
  }

  try {

    console.log("/getCreditTotals-req.body: ", req.body);
    const request: GetCreditTotalsRequest = req.body;

    // El userId, creditorCompanyId, roles, walletId y accountNumber vienen del JWT (req.user), nunca del body
    const authorizationContext: AuthorizationContext = {
      userId: req.user?.userId ?? '',
      creditorCompanyId: req.user?.creditorCompanyId ?? '',
      roles: req.user?.roles ?? [],
      ...(req.user?.walletId ? { walletId: req.user.walletId } : {}),
      ...(req.user?.accountNumber ? { accountNumber: req.user.accountNumber } : {}),
    };
    const result: Observable<Object> = creditService.getCreditTotals(request, authorizationContext);

    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /getCreditTotals:", error);
    res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
  }
});

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
creditRouter.post("/searchCreditsByEmployee", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) res.status(500).json({ error: 'La solicitud no cuenta con los parametros solicitados' });

  try {

     console.log("/searchCredits-req.body: ", req.body);

    const authorizationContext: AuthorizationContext = {
      userId: req.user?.userId ?? '',
      creditorCompanyId: req.user?.creditorCompanyId ?? '',
      ...(req.user?.walletId ? { walletId: req.user.walletId } : {}),
      ...(req.user?.accountNumber ? { accountNumber: req.user.accountNumber } : {}),
    };
    // 1. Llama al método que devuelve el Observable
    const result: Observable<Object> = creditService.searchCreditsByEmployee(req.body, authorizationContext);

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

// POST endpoint: autocomplete de "cliente existente" al crear un crédito —
// solo trae los clientes asignados al cobrador autenticado
creditRouter.post("/searchCustomersByEmployee", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {

  if (req.body === undefined || req.body == null) {
    res.status(400).json({ error: 'La solicitud no cuenta con los parametros solicitados' });
    return;
  }

  try {

    console.log("/searchCustomersByEmployee-req.body: ", req.body);
    const request: SearchCustomersByEmployeeRequest = req.body;

    // El userId y creditorCompanyId vienen del JWT (req.user), nunca del body
    const authorizationContext: AuthorizationContext = {
      userId: req.user?.userId ?? '',
      creditorCompanyId: req.user?.creditorCompanyId ?? '',
      roles: req.user?.roles ?? [],
    };
    const result: Observable<Object> = creditService.searchCustomersByEmployee(request, authorizationContext);

    const datos = await firstValueFrom(
      result.pipe(
        map((respuesta) => ({ mensaje: 'Datos obtenidos', data: respuesta }))
      )
    );

    res.status(200).json(datos);
  } catch (error) {
    console.error("Error en /searchCustomersByEmployee:", error);
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