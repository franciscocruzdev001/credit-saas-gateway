import cron from "node-cron";

export function helloCronJob(): void {
    cron.schedule("*/5 * * * * *", async () => {
        console.log("Hola desde servicio de Transactions")

    });
}
