import { metrics } from '@opentelemetry/api';
import type { Counter, Histogram } from '@opentelemetry/api';

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
  /** Increment a counter metric by 1. */
  incrementMetric(name: string): void;
  /** Record a value (gauge / histogram). */
  recordMetric(name: string, value: number): void;
}

/**
 * Returns a `Telemetry` handle backed by OpenTelemetry counters and
 * histograms.  Safe to call at any time — if the SDK has not been
 * initialised the underlying API silently no-ops.
 */
export function getTelemetry(): Telemetry {
  return telemetrySingleton;
}

const telemetrySingleton: Telemetry = {
  incrementMetric(name: string) {
    getCounter(name).add(1);
  },
  recordMetric(name: string, value: number) {
    getHistogram(name).record(value);
  },
};
