// src/logger/tskv.logger.ts
import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  formatMessage(level: string, message: any, ...optionalParams: any[]) {
    const baseFields = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
    };

    const additionalFields = this.extractFieldsFromParams(optionalParams);
    const allFields = { ...baseFields, ...additionalFields };

    return Object.entries(allFields)
      .map(([key, value]) => `${key}=${this.escapeValue(value)}`)
      .join('\t');
  }

  private escapeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value)
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  private extractFieldsFromParams(optionalParams: any[]): Record<string, string> {
    const result: Record<string, string> = {};
    
    // Первый параметр - контекст
    if (optionalParams[0] && typeof optionalParams[0] === 'string') {
        result.context = this.escapeValue(optionalParams[0]);
    }

    // Остальные параметры
    optionalParams.slice(1).forEach((param, index) => {
        if (typeof param === 'object' && param !== null && !Array.isArray(param)) {
        Object.entries(param).forEach(([key, value]) => {
            result[key] = this.escapeValue(value);
        });
        } else if (param !== undefined && param !== null) {
        result[`param${index}`] = this.escapeValue(param);
        }
    });

    return result;
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
   * Set log context (для совместимости)
   */
  setContext(context: string) {
    // Реализация для совместимости
  }
}