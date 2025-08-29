// test/logger/json.logger.spec.ts
import { JsonLogger } from '../../src/logger/json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatMessage', () => {
    it('should format simple string message correctly', () => {
      const result = logger.formatMessage('log', 'test message', 'TestContext');
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        timestamp: expect.any(String),
        level: 'LOG',
        message: 'test message',
        context: 'TestContext',
        params: undefined
      });
    });

    it('should format object message correctly', () => {
      const testObj = { key: 'value', number: 123 };
      const result = logger.formatMessage('error', testObj, 'ObjectTest');
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        timestamp: expect.any(String),
        level: 'ERROR',
        message: testObj,
        context: 'ObjectTest',
        params: undefined
      });
    });

    it('should include additional parameters', () => {
      const result = logger.formatMessage('warn', 'test', 'Context', { param1: 'value1' }, 'extra');
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        timestamp: expect.any(String),
        level: 'WARN',
        message: 'test',
        context: 'Context',
        params: [{ param1: 'value1' }, 'extra']
      });
    });

    it('should use default context when not provided', () => {
      const result = logger.formatMessage('debug', 'test');
      const parsed = JSON.parse(result);

      expect(parsed.context).toBe('NestJS');
    });
  });

  describe('log methods', () => {
    it('should call console.log with formatted JSON for log level', () => {
      logger.log('test message', 'TestContext', { additional: 'data' });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(logMessage);

      expect(parsed.level).toBe('LOG');
      expect(parsed.message).toBe('test message');
      expect(parsed.context).toBe('TestContext');
    });

    it('should call console.error with formatted JSON for error level', () => {
      logger.error('error message', 'ErrorContext');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logMessage);

      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('error message');
    });

    it('should call console.warn with formatted JSON for warn level', () => {
      logger.warn('warning message', 'WarnContext');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleWarnSpy.mock.calls[0][0];
      const parsed = JSON.parse(logMessage);

      expect(parsed.level).toBe('WARN');
      expect(parsed.message).toBe('warning message');
    });

    it('should call console.debug with formatted JSON for debug level', () => {
      logger.debug('debug message', 'DebugContext');

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleDebugSpy.mock.calls[0][0];
      const parsed = JSON.parse(logMessage);

      expect(parsed.level).toBe('DEBUG');
      expect(parsed.message).toBe('debug message');
    });

    it('should call console.debug with formatted JSON for verbose level', () => {
      logger.verbose('verbose message', 'VerboseContext');

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleDebugSpy.mock.calls[0][0];
      const parsed = JSON.parse(logMessage);

      expect(parsed.level).toBe('VERBOSE');
      expect(parsed.message).toBe('verbose message');
    });

    it('should call console.error with formatted JSON for fatal level', () => {
      logger.fatal('fatal message', 'FatalContext');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logMessage);

      expect(parsed.level).toBe('FATAL');
      expect(parsed.message).toBe('fatal message');
    });
  });

  describe('setContext', () => {
    it('should be callable without errors', () => {
      expect(() => {
        logger.setContext('TestContext');
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined messages', () => {
      logger.log(null, 'Context');
      logger.log(undefined, 'Context');

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      
      const nullMessage = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(nullMessage.message).toBe(null);

      const undefinedMessage = JSON.parse(consoleLogSpy.mock.calls[1][0]);
      expect(undefinedMessage.message).toBe('undefined');
    });

    it('should handle empty parameters', () => {
      const result = logger.formatMessage('log', 'test');
      const parsed = JSON.parse(result);

      expect(parsed.params).toBeUndefined();
    });
  });
});