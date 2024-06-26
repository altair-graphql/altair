import { GraphQLError } from 'graphql';
import { parseJson } from '../utils/json';
import { MultiResponseStrategy } from './types';
import { setByDotNotation } from '../utils/dot-notation';
import { QueryResponse } from '../types/state/query.interfaces';
type ErrorLike = Partial<GraphQLError> | Error;
type Extensions = Record<string, any>;
type Path = (string | number)[];

// Snapshot: https://github.com/graphql/graphql-spec/blob/c630301560d9819d33255d3ba00f548e8abbcdc6/spec/Section%207%20--%20Response.md#incremental
interface IncrementalStreamResult {
  items: unknown[] | null;
  path: Path;
  label?: string;
  errors?: ErrorLike[];
  extensions?: Extensions;
}

interface IncrementalDeferResult {
  data: Record<string, unknown> | null;
  path: Path;
  label?: string;
  errors?: ErrorLike[];
  extensions?: Extensions;
}

type IncrementalResult = IncrementalStreamResult | IncrementalDeferResult;

interface InitialExecutionResult {
  data?: null | Record<string, any>;
  errors?: ErrorLike[];
  extensions?: Extensions;
  hasNext?: boolean;
}

interface OldSubsequentExecutionResult extends InitialExecutionResult {
  path: Path;
}
interface SubsequentExecutionResultWithIncremental {
  incremental?: IncrementalResult[];
  errors?: ErrorLike[];
  extensions?: Extensions;
  hasNext: true;
}
interface SubsequentExecutionResultFinal {
  errors?: ErrorLike[];
  extensions?: Extensions;
  hasNext: false;
}

type SubsequentExecutionResult =
  | SubsequentExecutionResultWithIncremental
  | OldSubsequentExecutionResult
  | SubsequentExecutionResultFinal;

type ExecutionResult = InitialExecutionResult | SubsequentExecutionResult;

// https://github.com/graphql/graphql-wg/blob/main/rfcs/DeferStream.md
// https://github.com/graphql/graphql-over-http/blob/main/rfcs/IncrementalDelivery.md
// https://github.com/graphql/graphql-spec/blob/c630301560d9819d33255d3ba00f548e8abbcdc6/spec/Section%207%20--%20Response.md#incremental
// https://github.com/graphql/defer-stream-wg/discussions/69
export const buildResponse = (
  responses: QueryResponse[],
  strategy = MultiResponseStrategy.AUTO
): QueryResponse[] => {
  switch (strategy) {
    case MultiResponseStrategy.CONCATENATE:
      return buildResponse__concatenate(responses);
    case MultiResponseStrategy.APPEND:
      return buildResponse__append(responses);
    case MultiResponseStrategy.PATCH:
      return buildResponse__patch(responses);
    case MultiResponseStrategy.AUTO: {
      const firstResponse = responses[0];
      const parsedFirstResponse = parseJson(firstResponse?.content ?? '', {
        defaultValue: null,
      });
      // if response[0] is not a JSON object, then concatenate
      if (!parsedFirstResponse || typeof parsedFirstResponse !== 'object') {
        return buildResponse__concatenate(responses);
      }
      // if response[0] is patchable, then patch
      if ('data' in parsedFirstResponse && 'hasNext' in parsedFirstResponse) {
        return buildResponse__patch(responses);
      }
      // otherwise append
      return buildResponse__append(responses);
    }
    default:
      throw new Error('Invalid strategy');
  }
};

const buildResponse__concatenate = (responses: QueryResponse[]): QueryResponse[] => {
  const content = responses.map((r) => r.content).join('');
  const parsedContent = parseJson(content, {defaultValue: null});
  return [
    {
      content: parsedContent ? JSON.stringify(parsedContent, null, 2) : content,
      timestamp: responses.at(-1)?.timestamp ?? 0,
    },
  ];
};

const buildResponse__append = (responses: QueryResponse[]): QueryResponse[] => {
  return responses;
};

const buildResponse__patch = (responses: QueryResponse[]): QueryResponse[] => {
  if (responses.length === 0) {
    return [];
  }
  // first response is the same shape as a standard GraphQL response
  const obj = parseJson<InitialExecutionResult, null>(responses[0]?.content ?? '', {
    defaultValue: null,
  });

  if (!obj) {
    throw new Error('JSON response required for patching!');
  }
  // remove hasNext field from obj (since it's just used for patching)
  Reflect.deleteProperty(obj, 'hasNext');

  for (let i = 1; i < responses.length; i++) {
    const nextObj = parseJson<SubsequentExecutionResult, null>(
      responses[i]?.content ?? '',
      { defaultValue: null }
    );

    if (!nextObj) {
      throw new Error('JSON response required for patching!');
    }
    patchResponse(obj, nextObj);
  }
  // TODO: Handle cases with labels

  // return the patched response
  return [
    {
      content: JSON.stringify(obj, null, 2),
      timestamp: responses.at(0)?.timestamp ?? 0,
    },
  ];
};

const patchResponse = (
  obj: InitialExecutionResult,
  nextData: SubsequentExecutionResult
): ExecutionResult => {
  const result = { ...obj };
  let errors = result.errors ? result.errors : [];

  const extensions = {
    ...result.extensions,
    ...('extensions' in nextData ? nextData.extensions : {}),
  };

  if (nextData.errors) {
    errors.push(...nextData.errors);
  }

  if ('path' in nextData) {
    // old version of the incremental delivery payloads
    // https://github.com/graphql/graphql-over-http/blob/d80afd45782b40a9a8447fcff3d772689d83df56/rfcs/IncrementalDelivery.md
    nextData = {
      ...nextData,
      incremental: [
        {
          data: nextData.data ?? null,
          path: nextData.path,
        },
      ],
      hasNext: true,
    } satisfies SubsequentExecutionResultWithIncremental;
  }

  if (nextData.hasNext && nextData.incremental) {
    for (const patch of nextData.incremental) {
      if (Array.isArray(patch.errors)) {
        errors.push(...patch.errors);
      }

      if (patch.extensions) {
        Object.assign(extensions, patch.extensions);
      }

      const path = ['data', ...patch.path];
      if ('data' in patch) {
        // @defer patch
        // set the data at the path in result
        if (patch.data) {
          result.data = result.data ?? {};
          setByDotNotation(result, path, patch.data, true);
        }
      }
      if ('items' in patch) {
        // @stream patch
        patch.items?.forEach((item, i) => {
          const lastPathIdx = path[path.length - 1];
          if (typeof lastPathIdx !== 'number') {
            throw new Error(
              'Path for stream incremental payload should end with a number!'
            );
          }
          // for each item, we want to place it at the end of the array
          const newPath = [...path.slice(0, -1), lastPathIdx + i];
          setByDotNotation(result, newPath, item);
        });
      }
    }
  }

  return {
    ...result,
    ...(errors.length && { errors }),
    ...(Object.keys(extensions).length && { extensions }),
  };
};
