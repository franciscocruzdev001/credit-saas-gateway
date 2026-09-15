import pino, { Logger } from "pino";
import { ILoggerGateway } from "../repository/ILoggerGateway";

export class LoggerGateway implements ILoggerGateway {
    private readonly logger: Logger;
    constructor() {
        // pino-pretty es solo para desarrollo (formato/color en la terminal).
        // Su transport corre en un worker thread aparte que resuelve el módulo
        // de forma frágil en producción/contenedores (Render) — aunque el
        // paquete esté instalado, ahí truena. En producción se deja pino sin
        // transport, sacando JSON plano (que el visor de logs ya sabe leer).
        this.logger = pino({
            level: "info",
            ...(process.env.NODE_ENV !== "production" ? {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                        ignore: 'pid,hostname',
                    },
                },
            } : {}),
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