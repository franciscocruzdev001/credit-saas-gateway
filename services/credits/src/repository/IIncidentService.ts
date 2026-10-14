import { Observable } from 'rxjs';

export interface IIncidentService {
  // Registra las incidencias a la fecha consultada (créditos que no han tenido un pago aprobado desde esa fecha)
  registerDailyIncidents(consultDate: Date): Observable<Object>;
}
