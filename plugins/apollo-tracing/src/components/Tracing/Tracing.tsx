import './tracing.css';
import TracingRow from './TracingRow';

interface TracingData {
  version: number;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  duration: number; // in nanoseconds
  parsing?: {
    startOffset: number; // in nanoseconds
    duration: number; // in nanoseconds
  };
  validation?: {
    startOffset: number; // in nanoseconds
    duration: number; // in nanoseconds
  };
  execution?: {
    resolvers: {
      path: string[];
      parentType: string;
      fieldName: string;
      returnType: string;
      startOffset: number;
      duration: number;
    }[];
  };
}
export interface TracingProps {
  tracing?: TracingData;
  startTime?: number; // in ms
  endTime?: number; // in ms
}

function Tracing(props: TracingProps) {
  const { tracing, startTime = 0, endTime = 0 } = props;

  const tracingSupported = !!tracing && !!startTime && !!endTime;
  const requestDuration = startTime
    ? Math.abs(new Date(tracing?.startTime ?? 0).getTime() - startTime)
    : 0;
  const requestDurationNanoseconds = requestDuration * 1000 * 1000;
  const responseDurationNanoseconds =
    requestDurationNanoseconds + (tracing?.duration ?? 0);
  const resolvers = tracing?.execution?.resolvers || [];
  if (!tracingSupported) {
    return (
      <div className="not-supported">
        This GraphQL server doesnt support tracing. See the following page for
        instructions:
        <br />
        <a href="https://github.com/apollographql/apollo-tracing" target="_blank">
          https://github.com/apollographql/apollo-tracing
        </a>
      </div>
    );
  }

  return (
    <div className="tracing-wrapper">
      <div className="tracing-rows">
        <TracingRow
          path={['Request']}
          startOffset={0}
          duration={requestDurationNanoseconds}
        />
        {resolvers.map((res) => (
          <TracingRow
            key={res.path.join('.')}
            path={res.path}
            startOffset={(res.startOffset || 0) + requestDurationNanoseconds}
            duration={res.duration}
          />
        ))}
        <TracingRow
          path={['Response']}
          startOffset={(tracing.duration || 0) + requestDurationNanoseconds}
          duration={responseDurationNanoseconds}
        />
      </div>
    </div>
  );
}

export default Tracing;
