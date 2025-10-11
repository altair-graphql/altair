import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngrx/store';
import * as environmentsActions from '../../store/environments/environments.action';
import { getActiveSubEnvironmentState } from '../../store/environments/selectors';
import { NotifyService } from '../notify/notify.service';
import { take } from 'rxjs/operators';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import {
  CookieOptions,
  ScriptContextData,
  ScriptTransformResult,
} from 'altair-graphql-core/build/script/types';
import { RequestScriptError } from './errors';
import { DbService } from '../db.service';
import { ScriptEvaluatorClientEngine } from 'altair-graphql-core/build/script/evaluator-client-engine';
import { getGlobalContext } from 'altair-graphql-core/build/script/context';
import { EvaluatorClientFactory } from './evaluator-client.factory';
import { firstValueFrom } from 'rxjs';

const storageNamespace = 'request-script';

@Injectable({
  providedIn: 'root',
})
export class PreRequestService {
  private cookieService = inject(CookieService);
  private http = inject(HttpClient);
  private store = inject<Store<RootState>>(Store);
  private notifyService = inject(NotifyService);
  private dbService = inject(DbService);


  async executeScript(
    script: string,
    data: ScriptContextData
  ): Promise<ScriptTransformResult> {
    const disableNewScriptLogic = await this.store
      .select((state) => state.settings['beta.disable.newScript'])
      .pipe(take(1))
      .toPromise();

    if (disableNewScriptLogic) {
      return this.executeScriptOld(script, data);
    }
    return this.executeScriptNew(script, data);
  }

  async executeScriptNew(
    script: string,
    data: ScriptContextData
  ): Promise<ScriptTransformResult> {
    const self = this;

    // Use an allow list of cookies (configured in settings)
    const allowedCookiesList = await this.store
      .select((state) => state.settings['script.allowedCookies'])
      .pipe(take(1))
      .toPromise();
    const allCookies = self.cookieService.getAll();
    const cookies = Object.entries(allCookies).reduce(
      (acc, [key, value]) => {
        if (allowedCookiesList?.includes(key)) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );
    data.__cookieJar = cookies;

    const res = await new ScriptEvaluatorClientEngine(
      new EvaluatorClientFactory()
    ).executeScript(script, data, {
      alert: async (msg: string) =>
        this.notifyService.info(`Alert: ${msg}`, 'Request script'),
      log: async (d: unknown) => {
        debug.log('request script log:', d);
      },
      request: async (arg1, arg2, arg3) => {
        // https://angular.io/api/common/http/HttpClient#request
        try {
          return self.http.request(arg1, arg2, arg3).toPromise();
        } catch (err) {
          return null;
        }
      },
      setCookie: async (key: string, value: string, options?: CookieOptions) => {
        if (!allowedCookiesList?.includes(key)) {
          return this.notifyService.warning(
            `Cookie "${key}" is not allowed to be set by scripts. You can configure allowed cookies in settings.`,
            'Request script'
          );
        }
        self.cookieService.set(key, value, options);
      },
      getStorageItem: (key: string) => {
        return this.getStorageItem(key);
      },
      setStorageItem: (key: string, value: unknown) => {
        return this.setStorageItem(key, value);
      },
      updateActiveEnvironment: (environmentData: Record<string, unknown>) => {
        return this.updateActiveEnvironment(environmentData);
      },
    });
    debug.debug('script result:', res);

    return res;
  }
  async executeScriptOld(
    script: string,
    data: ScriptContextData
  ): Promise<ScriptTransformResult> {
    const Sval: typeof import('sval').default = ((await import('sval')) as any)
      .default;

    // deep cloning
    const clonedMutableData: ScriptContextData = JSON.parse(JSON.stringify(data));
    const interpreter = new Sval({
      ecmaVer: 10,
      sandBox: true,
    });

    interpreter.import({
      altair: getGlobalContext(clonedMutableData, {
        setCookie: async (key: string, value: string, options?: CookieOptions) => {
          this.cookieService.set(key, value, options);
        },
        request: async (arg1, arg2, arg3) => {
          // https://angular.io/api/common/http/HttpClient#request
          try {
            return firstValueFrom(this.http.request(arg1, arg2, arg3));
          } catch (err) {
            return null;
          }
        },
        getStorageItem: (key: string) => {
          return this.getStorageItem(key);
        },
        setStorageItem: (key: string, value: unknown) => {
          return this.setStorageItem(key, value);
        },
      }),
      alert: (msg: string) => this.notifyService.info(`Alert: ${msg}`),
    });
    interpreter.run(`
      const program = async() => {
        ${script};
        return altair.data;
      };
      exports.end = program();
    `);

    try {
      const res = await interpreter.exports.end;
      debug.log('interpreter result:', res);
    } catch (error) {
      throw new RequestScriptError(error);
    }
    if (clonedMutableData.__toSetActiveEnvironment) {
      await this.updateActiveEnvironment(clonedMutableData.__toSetActiveEnvironment);
    }
    return {
      environment: clonedMutableData.environment,
      requestScriptLogs: clonedMutableData.requestScriptLogs ?? [],
    };
  }
  private getStorageItem(key: string) {
    return this.dbService
      .getItem(`${storageNamespace}:${key}`)
      .pipe(take(1))
      .toPromise();
  }
  private setStorageItem(key: string, value: unknown) {
    return this.dbService
      .setItem(`${storageNamespace}:${key}`, value)
      .pipe(take(1))
      .toPromise();
  }
  private async updateActiveEnvironment(environmentData: Record<string, unknown>) {
    const activeEnvState = await this.store
      .select(getActiveSubEnvironmentState)
      .pipe(take(1))
      .toPromise();

    if (activeEnvState) {
      try {
        const envVariables = {
          ...JSON.parse(activeEnvState.variablesJson),
          ...environmentData,
        };
        const activeEnvStateId = activeEnvState.id;

        if (!activeEnvStateId) {
          throw new RequestScriptError('Invalid active environment state ID');
        }

        this.store.dispatch(
          new environmentsActions.UpdateSubEnvironmentJsonAction({
            id: activeEnvStateId,
            value: JSON.stringify(envVariables, null, 2),
          })
        );
        this.notifyService.info(
          `Updated active environment variables: ${Object.keys(environmentData).join(
            ', '
          )}.`,
          'Request script'
        );
      } catch (error) {
        this.notifyService.errorWithError(
          error,
          `Could not update active environment variables.`,
          'Request script'
        );
      }
    } else {
      this.notifyService.warning(
        'No active environment selected. Cannot update environment variables',
        'Request script'
      );
    }
  }
}
