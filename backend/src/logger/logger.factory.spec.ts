// test/logger/logger.factory.spec.ts
import { createLogger } from '../../src/logger/logger.factory';
import { DevLogger } from '../../src/logger/dev.logger';
import { JsonLogger } from '../../src/logger/json.logger';
import { TskvLogger } from '../../src/logger/tskv.logger';

describe('LoggerFactory', () => {
  beforeEach(() => {
    // Сохраняем оригинальное значение env
    process.env.LOGGER_TYPE = '';
  });

  it('should return DevLogger by default', () => {
    const logger = createLogger();
    expect(logger).toBeInstanceOf(DevLogger);
  });

  it('should return DevLogger for "dev" type', () => {
    process.env.LOGGER_TYPE = 'dev';
    const logger = createLogger();
    expect(logger).toBeInstanceOf(DevLogger);
  });

  it('should return JsonLogger for "json" type', () => {
    process.env.LOGGER_TYPE = 'json';
    const logger = createLogger();
    expect(logger).toBeInstanceOf(JsonLogger);
  });

  it('should return TskvLogger for "tskv" type', () => {
    process.env.LOGGER_TYPE = 'tskv';
    const logger = createLogger();
    expect(logger).toBeInstanceOf(TskvLogger);
  });

  it('should handle case insensitive types', () => {
    process.env.LOGGER_TYPE = 'JSON';
    const logger = createLogger();
    expect(logger).toBeInstanceOf(JsonLogger);
  });

  it('should return DevLogger for unknown types', () => {
    process.env.LOGGER_TYPE = 'unknown';
    const logger = createLogger();
    expect(logger).toBeInstanceOf(DevLogger);
  });
});