const MIN_BAR_WIDTH = 3;
const FACTOR = 1000 * 1000; // Convert nanoseconds to pixel scale (1 pixel = 1 ms)

function printDuration(nanoSeconds: number): string {
  const microSeconds = Math.round(nanoSeconds / 1000);
  if (microSeconds > 1000) {
    const ms = Math.round(microSeconds / 1000);
    return `${ms} ms`;
  }
  return `${microSeconds} µs`;
}

export interface TracingRowProps {
  path: string[];
  startOffset: number;
  duration: number;
}

function TracingRow(props: TracingRowProps) {
  const offsetLeft = props.startOffset / FACTOR;
  const barWidth = Math.max(props.duration / FACTOR, MIN_BAR_WIDTH);
  return (
    <div
      className="tracing-row"
      style={{
        transform: `translateX(${offsetLeft}px)`,
      }}
    >
      <span className="tracing-row__name-wrapper">
        <span className="tracing-row__name">
          {props.path.slice(-2).map((p, idx) => (
            <span
              key={p}
              style={{ opacity: idx === props.path.slice(-2).length - 1 ? 1 : 0.6 }}
            >
              {`${idx > 0 ? '.' : ''}${p}`}
            </span>
          ))}
        </span>
      </span>
      <span className="tracing-row__bar" style={{ width: `${barWidth}px` }}></span>
      <span className="tracing-row__duration">{printDuration(props.duration)}</span>
    </div>
  );
}

export default TracingRow;
