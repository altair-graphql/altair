import { env } from '../common/env';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { resourceFromAttributes } from '@opentelemetry/resources';

/**
 * Initialise the OpenTelemetry SDK.
 *
 * This file must be loaded **before** any application code so the SDK can
 * monkey-patch HTTP / Express / etc. modules before they are imported.
 *
 * All configuration is read from the validated `env` config object
 * (see `src/common/env.ts`) rather than relying on the OTel SDK's
 * built-in environment variable reading.  This keeps every tunable
 * in one place and lets the Zod schema enforce defaults / validation.
 *
 * Relevant config keys:
 *
 *   OTEL_SERVICE_NAME              – logical service name (default "altair-api")
 *   OTEL_EXPORTER_OTLP_ENDPOINT   – collector / backend URL
 *   OTEL_EXPORTER_OTLP_HEADERS    – auth headers ("key=value,key2=value2")
 *   OTEL_METRIC_EXPORT_INTERVAL   – metric flush interval in ms (default 60 000)
 *
 * If OTEL_EXPORTER_OTLP_ENDPOINT is not set the SDK is still initialised
 * but exporters have no destination, so traces/metrics are silently dropped
 * (application code can safely reference counters and histograms without
 * guarding against undefined).
 */

// ── Parse headers string into a Record ──────────────────────────────
function parseHeaders(raw?: string): Record<string, string> | undefined {
  if (!raw) return undefined;
  const result: Record<string, string> = {};
  for (const pair of raw.split(',')) {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      result[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

// ── Build per-signal URLs from the base endpoint ────────────────────
// OTLP HTTP exporters need the full signal path (e.g. /v1/traces).
function signalUrl(base: string | undefined, path: string): string | undefined {
  if (!base) return undefined;
  const normalised = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalised}${path}`;
}

const headers = parseHeaders(env.OTEL_EXPORTER_OTLP_HEADERS);

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
});

const sdk = new NodeSDK({
  resource,

  // Traces
  traceExporter: new OTLPTraceExporter({
    url: signalUrl(env.OTEL_EXPORTER_OTLP_ENDPOINT, '/v1/traces'),
    headers,
  }),

  // Metrics
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: signalUrl(env.OTEL_EXPORTER_OTLP_ENDPOINT, '/v1/metrics'),
      headers,
    }),
    exportIntervalMillis: env.OTEL_METRIC_EXPORT_INTERVAL,
  }),

  // Auto-instrumentation for HTTP, Express, NestJS, Prisma, etc.
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable fs instrumentation – it is very noisy and rarely useful
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

// Graceful shutdown
const shutdown = () => {
  sdk.shutdown().catch((err) => console.error('OpenTelemetry shutdown error', err));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
