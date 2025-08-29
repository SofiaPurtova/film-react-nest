// src/logger/json.logger.ts
import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  formatMessage(level: string, message: any, ...optionalParams: any[]) {
    return JSON.stringify({ 
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: typeof message === 'object' ? message : String(message),
      context: optionalParams[0] || 'NestJS',
      params: optionalParams.slice(1).length > 0 ? optionalParams.slice(1) : undefined
    });
  }

  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('verbose', message, ...optionalParams));
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('fatal', message, ...optionalParams));
  }

  /**
   * Set log context (для совместимости с ConsoleLogger)
   */
  setContext(context: string) {
    // Реализация для совместимости, но не используется в JSON формате
  }
}