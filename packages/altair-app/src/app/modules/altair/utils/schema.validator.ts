import { isDevMode } from '@angular/core';
import { map, pipe } from 'rxjs';
import { z } from 'zod/v4';
import { debug } from './logger';

export function verifyResponse<T extends z.ZodTypeAny>(zodObj: T) {
  return pipe(
    map((response) => {
      if (isDevMode()) {
        const result = zodObj.safeParse(response);
        if (!result.success) {
          debug.error(result.error);
        }
      }
      return response as z.infer<T>;
    })
  );
}
