import { metrics } from '@opentelemetry/api';
import type { Counter, Gauge, Histogram } from '@opentelemetry/api';

const METER_NAME = 'altair-api';

/** Lazy singleton meter. */
const getMeter = (() => {
  let meter: ReturnType<typeof metrics.getMeter> | undefined;
  return () => {
    if (!meter) {
      meter = metrics.getMeter(METER_NAME);
    }
    return meter;
  };
})();

// ── Instrument caches ────────────────────────────────────────────────
const counters = new Map<string, Counter>();
const gauges = new Map<string, Gauge>();
const histograms = new Map<string, Histogram>();

function getCounter(name: string): Counter {
  let counter = counters.get(name);
  if (!counter) {
    counter = getMeter().createCounter(name, {
      description: `Counter for ${name}`,
    });
    counters.set(name, counter);
  }
  return counter;
}

function getGauge(name: string): Gauge {
  let gauge = gauges.get(name);
  if (!gauge) {
    gauge = getMeter().createGauge(name, {
      description: `Gauge for ${name}`,
    });
    gauges.set(name, gauge);
  }
  return gauge;
}

function getHistogram(name: string): Histogram {
  let histogram = histograms.get(name);
  if (!histogram) {
    histogram = getMeter().createHistogram(name, {
      description: `Histogram for ${name}`,
    });
    histograms.set(name, histogram);
  }
  return histogram;
}

// ── Public API ───────────────────────────────────────────────────────

export interface Telemetry {
  /**
   * Increment a monotonic counter by 1.
   * Use for event occurrences: requests, errors, logins, etc.
   */
  incrementMetric(name: string): void;

  /**
   * Record a point-in-time snapshot value (gauge).
   * Use for current-state measurements: resource counts, balances,
   * active connections, etc.
   */
  setGauge(name: string, value: number): void;

  /**
   * Record a value into a histogram (distribution).
   * Use for values you want to see min/max/avg/percentiles of:
   * latency, token counts, purchase amounts, etc.
   */
  recordMetric(name: string, value: number): void;
}

/**
 * Returns a `Telemetry` handle backed by OpenTelemetry counters, gauges,
 * and histograms.  Safe to call at any time — if the SDK has not been
 * initialised the underlying API silently no-ops.
 */
export function getTelemetry(): Telemetry {
  return telemetrySingleton;
}

const telemetrySingleton: Telemetry = {
  incrementMetric(name: string) {
    getCounter(name).add(1);
  },
  setGauge(name: string, value: number) {
    getGauge(name).record(value);
  },
  recordMetric(name: string, value: number) {
    getHistogram(name).record(value);
  },
};
