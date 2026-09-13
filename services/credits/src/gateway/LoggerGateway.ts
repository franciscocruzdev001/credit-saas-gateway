import pino, { Logger } from "pino";
import { ILoggerGateway } from "../repository/ILoggerGateway";

export class LoggerGateway implements ILoggerGateway {
    private readonly logger: Logger;
    constructor() {
        this.logger = pino({
            level: "info",
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
        });
    }

    public info(data: unknown, message?: string): void {
        this.logger.info(data, message);
    }
    public warn(data: unknown, message?: string): void {
        this.logger.warn(data, message);
    }
    public error(data: unknown, message?: string): void {
        this.logger.error(data, message);
    }
    public debug(data: unknown, message?: string): void {
        this.logger.debug(data, message);
    }
}