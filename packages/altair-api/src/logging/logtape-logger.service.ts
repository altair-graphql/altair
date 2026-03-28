import { LoggerService } from '@nestjs/common';
import { getLogger, type Logger } from '@logtape/logtape';

/**
 * A NestJS LoggerService adapter that delegates to LogTape.
 *
 * Use this as the global NestJS logger via `app.useLogger(new LogTapeLoggerService())`.
 * NestJS internally passes a `context` string (typically the class name) as the last
 * argument to each log method. We map that to a LogTape child category so log
 * output is structured as `["altair-api", "SomeService"]`.
 */
export class LogTapeLoggerService implements LoggerService {
  private readonly root: Logger;

  constructor(category: string[] = ['altair-api']) {
    this.root = getLogger(category);
  }

  private getLogger(context?: string): Logger {
    return context ? this.root.getChild(context) : this.root;
  }

  log(message: any, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    this.getLogger(context).info(String(message));
  }

  error(message: any, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    const stack = this.extractStack(optionalParams);
    if (stack) {
      this.getLogger(context).error('{message}\n{stack}', {
        message: String(message),
        stack,
      });
    } else {
      this.getLogger(context).error(String(message));
    }
  }

  warn(message: any, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    this.getLogger(context).warn(String(message));
  }

  debug?(message: any, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    this.getLogger(context).debug(String(message));
  }

  verbose?(message: any, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    this.getLogger(context).trace(String(message));
  }

  fatal?(message: any, ...optionalParams: any[]): void {
    const context = this.extractContext(optionalParams);
    this.getLogger(context).fatal(String(message));
  }

  /**
   * NestJS passes the context (class name) as the last string argument.
   */
  private extractContext(params: any[]): string | undefined {
    if (params.length === 0) return undefined;
    const last = params[params.length - 1];
    return typeof last === 'string' ? last : undefined;
  }

  /**
   * For error() calls, NestJS may pass a stack trace as the first optional param.
   */
  private extractStack(params: any[]): string | undefined {
    if (params.length === 0) return undefined;
    const first = params[0];
    return typeof first === 'string' && first.includes('\n') ? first : undefined;
  }
}
