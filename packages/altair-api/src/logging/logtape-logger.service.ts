import { Injectable, LoggerService } from '@nestjs/common';
import { getLogger, type Logger } from '@logtape/logtape';

/**
 * A NestJS LoggerService adapter that delegates to LogTape.
 *
 * Use this as the global NestJS logger via `app.useLogger(new LogTapeLoggerService())`.
 *
 * NestJS's built-in `Logger` class appends the constructor-provided context
 * string as the **last** argument to every call.  For `error()` specifically,
 * if no extra params were supplied by the caller NestJS inserts `undefined`
 * before the context to reserve the "stack trace" positional slot.
 *
 * The remaining arguments between `message` and the trailing context are
 * extra data (error objects, stack strings, metadata objects, etc.) that
 * callers pass.  We forward them into LogTape as structured properties so
 * nothing is silently discarded.
 */
@Injectable()
export class LogTapeLoggerService implements LoggerService {
  private readonly root: Logger;

  constructor(category: string[] = ['altair-api']) {
    this.root = getLogger(category);
  }

  private getLogger(context?: string): Logger {
    return context ? this.root.getChild(context) : this.root;
  }

  // ── public LoggerService API ────────────────────────────────────────

  log(message: any, ...optionalParams: any[]): void {
    const { context, extra } = this.parseParams(optionalParams);
    this.getLogger(context).info(String(message), extra);
  }

  error(message: any, ...optionalParams: any[]): void {
    const { context, extra } = this.parseErrorParams(optionalParams);
    this.getLogger(context).error(String(message), extra);
  }

  warn(message: any, ...optionalParams: any[]): void {
    const { context, extra } = this.parseParams(optionalParams);
    this.getLogger(context).warn(String(message), extra);
  }

  debug?(message: any, ...optionalParams: any[]): void {
    const { context, extra } = this.parseParams(optionalParams);
    this.getLogger(context).debug(String(message), extra);
  }

  verbose?(message: any, ...optionalParams: any[]): void {
    const { context, extra } = this.parseParams(optionalParams);
    this.getLogger(context).trace(String(message), extra);
  }

  fatal?(message: any, ...optionalParams: any[]): void {
    const { context, extra } = this.parseParams(optionalParams);
    this.getLogger(context).fatal(String(message), extra);
  }

  // ── argument parsing ────────────────────────────────────────────────

  /**
   * Generic parser for log/warn/debug/verbose/fatal.
   *
   * NestJS sends:  (message, ...callerArgs, context?)
   * The last element is context if it's a string.
   * Everything in between is extra data from the call site.
   */
  private parseParams(params: any[]): {
    context: string | undefined;
    extra: Record<string, unknown>;
  } {
    if (params.length === 0) {
      return { context: undefined, extra: {} };
    }

    const last = params[params.length - 1];
    const hasContext = typeof last === 'string';
    const context = hasContext ? last : undefined;
    const rest = hasContext ? params.slice(0, -1) : params;

    return { context, extra: this.buildExtra(rest) };
  }

  /**
   * Parser for error() which has a different NestJS convention:
   *
   * NestJS sends:  (message, stack?, ...callerArgs, context?)
   *
   * - If the caller passed no extra args:  (message, undefined, context)
   * - If the caller passed a stack string: (message, stack, context)
   * - If the caller passed an object:      (message, object, context)
   */
  private parseErrorParams(params: any[]): {
    context: string | undefined;
    extra: Record<string, unknown>;
  } {
    if (params.length === 0) {
      return { context: undefined, extra: {} };
    }

    const last = params[params.length - 1];
    const hasContext = typeof last === 'string';
    const context = hasContext ? last : undefined;
    const rest = hasContext ? params.slice(0, -1) : params;

    // Filter out the `undefined` placeholder NestJS inserts when
    // error() is called with no extra args.
    const filtered = rest.filter((v) => v !== undefined);

    const extra: Record<string, unknown> = {};

    for (const item of filtered) {
      if (typeof item === 'string' && this.isStackTrace(item)) {
        extra.stack = item;
      } else if (item instanceof Error) {
        extra.error = item;
        if (item.stack) {
          extra.stack = item.stack;
        }
      } else if (typeof item === 'object' && item !== null) {
        Object.assign(extra, item);
      } else {
        extra.data = item;
      }
    }

    return { context, extra };
  }

  /**
   * Convert an array of arbitrary extra values into a flat object
   * suitable for LogTape structured properties.
   */
  private buildExtra(rest: any[]): Record<string, unknown> {
    if (rest.length === 0) return {};

    const extra: Record<string, unknown> = {};
    for (const item of rest) {
      if (item instanceof Error) {
        extra.error = item;
        if (item.stack) {
          extra.stack = item.stack;
        }
      } else if (typeof item === 'object' && item !== null) {
        Object.assign(extra, item);
      } else if (item !== undefined) {
        extra.data = item;
      }
    }
    return extra;
  }

  private isStackTrace(value: string): boolean {
    return /^(.)+\n\s+at .+:\d+:\d+/.test(value);
  }
}
