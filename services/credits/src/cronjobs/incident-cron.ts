import cron from "node-cron";
import { containerApp } from "../infrastructure/Container";
import { TYPES } from "../constant/types";
import { IIncidentService } from "../repository/IIncidentService";

export function startIncidentCronJob(): void {
    // Pide el servicio al contenedor 
    const incidentService = containerApp.get<IIncidentService>(TYPES.IncidentService);

    // Cada 20 segundos (prueba)
    cron.schedule("*/10 * * * * *", () => {
        // Fecha a consultar: hoy a las 00:00 hora de México,
        // así un pago aprobado hoy no cuenta como "anterior" a la consulta.
        // "en-CA" da la fecha como YYYY-MM-DD; el timeZone evita el desfase de Render (UTC).
        const todayMx: string = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
        const consultDate: Date = new Date(`${todayMx}T00:00:00-06:00`);

        incidentService.registerDailyIncidents(consultDate).subscribe();
    }, { timezone: "America/Mexico_City" });
}
