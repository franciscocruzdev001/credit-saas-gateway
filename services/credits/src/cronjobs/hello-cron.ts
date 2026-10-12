import cron from "node-cron";

export function helloCronjob(): void {
    cron.schedule("*/5 * * * * *", async () => {
        console.log("Hola desde servicio de Credits")

    });
}
