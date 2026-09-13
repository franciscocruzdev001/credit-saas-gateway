/**
 * Logic gateway to connect logger pino
 */
export interface ILoggerGateway {
    /**
     * Register information data and menssage
     * @param data 
     * @param message 
     */
    info(data: unknown, message?: string): void;
    /**
     * Register warning data and message
     * @param data : data to object and entity
     * @param message : data to message mapping
     */
    warn(data: unknown, message?: string): void;
    /**
     * Register errror data and message
     * @param data 
     * @param message 
     */
    error(data: unknown, message?: string): void;
    /**
     * Register debug data and message
     * @param data 
     * @param message 
     */
    debug(data: unknown, message?: string): void;
}