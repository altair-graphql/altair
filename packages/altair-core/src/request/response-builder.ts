import { GraphQLError } from 'graphql';
import { parseJson } from '../utils/json';
import { MultiResponseStrategy } from './types';
import { setByDotNotation } from '../utils/dot-notation';
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
  | SubsequentExecutionResultFinal;

type ExecutionResult = InitialExecutionResult | SubsequentExecutionResult;

// https://github.com/graphql/graphql-wg/blob/main/rfcs/DeferStream.md
// https://github.com/graphql/graphql-over-http/blob/main/rfcs/IncrementalDelivery.md
// https://github.com/graphql/graphql-spec/blob/c630301560d9819d33255d3ba00f548e8abbcdc6/spec/Section%207%20--%20Response.md#incremental
// https://github.com/graphql/defer-stream-wg/discussions/69
export const buildResponse = (
  responses: string[],
  strategy = MultiResponseStrategy.AUTO
): string[] => {
  switch (strategy) {
    case MultiResponseStrategy.CONCATENATE:
      return buildResponse__concatenate(responses);
    case MultiResponseStrategy.APPEND:
      return buildResponse__append(responses);
    case MultiResponseStrategy.PATCH:
      return buildResponse__patch(responses);
    case MultiResponseStrategy.AUTO: {
      const firstResponse = responses[0];
      const parsedFirstResponse = parseJson(firstResponse ?? '', {
        defaultValue: undefined,
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

const buildResponse__concatenate = (responses: string[]): string[] => {
  return [responses.join('')];
};

const buildResponse__append = (responses: string[]): string[] => {
  return responses;
};

const buildResponse__patch = (responses: string[]): string[] => {
  const response = '';
  // first response is the same shape as a standard GraphQL response
  const obj = parseJson<InitialExecutionResult, undefined>(responses[0] ?? '', {
    defaultValue: undefined,
  });

  if (!obj) {
    throw new Error('JSON response required for patching!');
  }

  for (let i = 1; i < responses.length; i++) {
    const nextObj = parseJson<SubsequentExecutionResult, undefined>(
      responses[i] ?? '',
      { defaultValue: undefined }
    );

    if (!nextObj) {
      throw new Error('JSON response required for patching!');
    }
    patchResponse(obj, nextObj);
  }
  // TODO: Handle cases with labels
  // TODO: Handle without incremental field

  // return the patched response
  return [JSON.stringify(obj, null, 2)];
};

const patchResponse = (
  obj: InitialExecutionResult,
  nextData: SubsequentExecutionResult
): ExecutionResult => {
  const result = { ...obj };
  // remove hasNext field from the result (since it's just used for patching)
  Reflect.deleteProperty(result, 'hasNext');
  let errors = result.errors ? result.errors : [];

  const extensions = {
    ...result.extensions,
    ...('extensions' in nextData ? nextData.extensions : {}),
  };

  if (nextData.errors) {
    errors.push(...nextData.errors);
  }

  if (nextData.hasNext && nextData.incremental) {
    // TODO: NOTE: We handle the old version of the incremental delivery payloads as well
    // if ('path' in nextResult) {
    //   incremental = [nextResult as IncrementalPayload];
    // }

    for (const patch of nextData.incremental) {
      if (Array.isArray(patch.errors)) {
        errors.push(...patch.errors);
      }

      if (patch.extensions) {
        Object.assign(extensions, patch.extensions);
      }

      const path = ['data', ...patch.path];
      if ('data' in patch) {
        // defer patch
        // set the data at the path in result
        if (patch.data) {
          result.data = result.data ?? {};
          setByDotNotation(result, path, patch.data, true);
        }
      }
      if ('items' in patch) {
        // stream patch
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
