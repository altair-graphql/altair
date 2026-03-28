import {
  configure,
  getConsoleSink,
  getAnsiColorFormatter,
  getJsonLinesFormatter,
} from '@logtape/logtape';

/**
 * Set up LogTape for the Altair API.
 *
 * - In **production** logs are emitted as JSON Lines (one JSON object per line)
 *   which is ideal for log aggregation services (Datadog, CloudWatch, etc.).
 * - In **development / test** logs use coloured, human-readable output.
 *
 * Call this once, as early as possible in the process lifetime — ideally
 * before `NestFactory.create()` so that buffered NestJS logs are already
 * routed through LogTape.
 */
export async function setupLogTape(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';

  await configure({
    // Allow reconfiguring (e.g. in tests)
    reset: true,
    sinks: {
      console: getConsoleSink({
        formatter: isProduction
          ? getJsonLinesFormatter()
          : getAnsiColorFormatter(),
      }),
    },
    loggers: [
      {
        category: ['altair-api'],
        lowestLevel: isProduction ? 'info' : 'debug',
        sinks: ['console'],
      },
      // Catch-all for third-party libraries that also use LogTape
      {
        category: [],
        lowestLevel: 'warning',
        sinks: ['console'],
      },
    ],
  });
}
