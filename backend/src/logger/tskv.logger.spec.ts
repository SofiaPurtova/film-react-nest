// test/logger/tskv.logger.spec.ts
import { TskvLogger } from '../../src/logger/tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatMessage', () => {
    it('should format simple string message in TSKV format', () => {
      const result = logger.formatMessage('log', 'test message', 'TestContext');
      
      expect(result).toMatch(/timestamp=/);
      expect(result).toMatch(/level=LOG/);
      expect(result).toMatch(/message=test message/);
      expect(result).toMatch(/context=TestContext/);
      expect(result).toContain('\t');
    });

    it('should format object message correctly', () => {
      const testObj = { key: 'value', number: 123 };
      const result = logger.formatMessage('error', testObj, 'ObjectTest');
      
      expect(result).toMatch(/message=\{"key":"value","number":123\}/);
    });

    it('should include additional parameters as separate fields', () => {
      const result = logger.formatMessage('warn', 'test', 'Context', { key: 'value' }, 'extra');
      
      expect(result).toMatch(/key=value/);
      expect(result).toMatch(/param1=extra/);
    });

    it('should escape special characters', () => {
      const result = logger.formatMessage('debug', 'message with\ttab\nnewline', 'Context\nTest');
      
      expect(result).toContain('message=message with\\ttab\\nnewline');
      expect(result).toContain('context=Context\\nTest');
    });
  });

  describe('escapeValue', () => {
    it('should escape tabs', () => {
      const escaped = (logger as any).escapeValue('text\twith\ttabs');
      expect(escaped).toBe('text\\twith\\ttabs');
    });

    it('should escape newlines', () => {
      const escaped = (logger as any).escapeValue('text\nwith\nnewlines');
      expect(escaped).toBe('text\\nwith\\nnewlines');
    });

    it('should escape carriage returns', () => {
      const escaped = (logger as any).escapeValue('text\rwith\rcarriage');
      expect(escaped).toBe('text\\rwith\\rcarriage');
    });

    it('should handle null and undefined', () => {
      expect((logger as any).escapeValue(null)).toBe('');
      expect((logger as any).escapeValue(undefined)).toBe('');
    });
  });

  describe('extractFieldsFromParams', () => {
    it('should extract context from first string parameter', () => {
      const result = (logger as any).extractFieldsFromParams(['TestContext', { data: 'value' }]);
      expect(result.context).toBe('TestContext');
    });

    it('should extract fields from object parameters', () => {
      const result = (logger as any).extractFieldsFromParams([
        undefined, 
        { key: 'value', number: 123 }
      ]);
      expect(result.key).toBe('value');
      expect(result.number).toBe('123');
    });

    it('should handle primitive parameters', () => {
      const result = (logger as any).extractFieldsFromParams([undefined, 'stringParam', 42, true]);
      expect(result.param0).toBe('stringParam');
      expect(result.param1).toBe('42');
      expect(result.param2).toBe('true');
    });

    it('should handle mixed parameters', () => {
      const result = (logger as any).extractFieldsFromParams([
        'Context',
        { objKey: 'objValue' },
        'stringParam',
        42
      ]);
      
      expect(result.objKey).toBe('objValue');
      expect(result.param1).toBe('stringParam');
      expect(result.param2).toBe('42');
    });
  });

  describe('log methods', () => {
    it('should call console.log with TSKV format for log level', () => {
      logger.log('test message', 'TestContext', { additional: 'data' });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleLogSpy.mock.calls[0][0];
      
      expect(logMessage).toMatch(/level=LOG/);
      expect(logMessage).toMatch(/message=test message/);
      expect(logMessage).toMatch(/context=TestContext/);
      expect(logMessage).toMatch(/additional=data/);
    });

    it('should call console.error for error level', () => {
      logger.error('error message', 'ErrorContext');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should call console.warn for warn level', () => {
      logger.warn('warning message', 'WarnContext');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should call console.debug for debug level', () => {
      logger.debug('debug message', 'DebugContext');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it('should call console.debug for verbose level', () => {
      logger.verbose('verbose message', 'VerboseContext');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it('should call console.error for fatal level', () => {
      logger.fatal('fatal message', 'FatalContext');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('setContext', () => {
    it('should be callable without errors', () => {
      expect(() => {
        logger.setContext('TestContext');
      }).not.toThrow();
    });
  });
});