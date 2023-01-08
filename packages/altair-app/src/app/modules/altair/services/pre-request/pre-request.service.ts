import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';

import * as fromHeader from '../../store/headers/headers.reducer';
import * as fromRoot from '../../store';
import { IDictionary } from '../../interfaces/shared';
import { Store } from '@ngrx/store';
import * as environmentsActions from '../../store/environments/environments.action';
import { getActiveSubEnvironmentState } from '../../store/environments/selectors';
import { NotifyService } from '../notify/notify.service';
import { first, take } from 'rxjs/operators';
import { SendRequestResponse } from '../gql/gql.service';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { RequestScriptError } from './errors';
import { LogLine } from 'altair-graphql-core/build/types/state/query.interfaces';

export enum RequestType {
  INTROSPECTION = 'introspection',
  QUERY = 'query',
  SUBSCRIPTION = 'subscription',
}
interface ScriptContextHelpers {
  getEnvironment: (key: string) => any;
  setEnvironment: (key: string, value: any) => void;
  getCookie: (key: string) => string;
  request: (arg1: any, arg2: any, arg3: any) => Promise<ArrayBuffer | null>;
}

export interface ScriptContextData {
  headers: HeaderState;
  variables: string;
  query: string;
  environment: IDictionary;
  requestScriptLogs?: LogLine[];
  response?: SendRequestResponse;
  requestType?: RequestType;
  __toSetActiveEnvironment?: IDictionary;
}

interface ScriptContextResponse {
  requestType: RequestType;
  responseTime: number;
  statusCode: number;
  body: unknown;
  headers: IDictionary;
}
export interface GlobalHelperContext {
  data: ScriptContextData;
  helpers: ScriptContextHelpers;
  importModule: (moduleName: string) => any;
  log: (d: unknown) => void;
  response?: ScriptContextResponse;
}

interface ModuleImportsMap {
  [name: string]: { exec: () => Promise<any> };
}

const ModuleImports: ModuleImportsMap = {
  atob: {
    async exec() {
      return (await import('abab')).atob;
    },
  },
  btoa: {
    async exec() {
      return (await import('abab')).btoa;
    },
  },
  'crypto-js': {
    async exec() {
      return (await import('crypto-js')).default;
    },
  },
};

@Injectable({
  providedIn: 'root',
})
export class PreRequestService {
  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
    private store: Store<RootState>,
    private notifyService: NotifyService
  ) {}

  async executeScript(
    script: string,
    data: ScriptContextData
  ): Promise<ScriptContextData> {
    const Sval: typeof import('sval').default = ((await import('sval')) as any)
      .default;

    // deep cloning
    const clonedMutableData: ScriptContextData = JSON.parse(
      JSON.stringify(data)
    );
    const interpreter = new Sval({
      ecmaVer: 10,
      sandBox: true,
    });
    interpreter.import({
      altair: this.getGlobalContext(clonedMutableData),
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
      const activeEnvState = await this.store
        .select(getActiveSubEnvironmentState)
        .pipe(take(1))
        .toPromise();

      if (activeEnvState) {
        try {
          const envVariables = {
            ...JSON.parse(activeEnvState.variablesJson),
            ...clonedMutableData.__toSetActiveEnvironment,
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
            `Updated active environment variables: ${Object.keys(
              clonedMutableData.__toSetActiveEnvironment
            ).join(', ')}.`,
            'Request script'
          );
        } catch (error) {
          this.notifyService.error(
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
    return clonedMutableData;
  }

  getGlobalContext(data: ScriptContextData): GlobalHelperContext {
    const self = this;

    return {
      data,
      helpers: {
        getEnvironment: (key: string) => {
          return data.environment[key];
        },
        /**
         * @param key environment key
         * @param val value to set
         * @param activeEnvironment if the value should be replaced in the currently active environment after execution
         */
        setEnvironment: (
          key: string,
          val: unknown,
          activeEnvironment = false
        ) => {
          data.environment[key] = val;
          if (activeEnvironment) {
            data.__toSetActiveEnvironment = data.__toSetActiveEnvironment || {};
            data.__toSetActiveEnvironment[key] = val;
          }
        },
        getCookie: (key: string) => {
          return self.cookieService.get(key);
        },
        request: async (arg1, arg2, arg3) => {
          // https://angular.io/api/common/http/HttpClient#request
          try {
            return self.http.request(arg1, arg2, arg3).toPromise();
          } catch (err) {
            return null;
          }
        },
      },
      importModule: (moduleName: string) => this.importModuleHelper(moduleName),
      response: this.buildContextResponse(data),
      log: (d) => {
        data.requestScriptLogs = data.requestScriptLogs || [];
        data.requestScriptLogs.push({
          time: Date.now(),
          text: JSON.stringify(d, null, 2),
          source: 'Request script',
        });
      },
    };
  }

  async importModuleHelper(moduleName: string) {
    if (!Object.keys(ModuleImports).includes(moduleName)) {
      throw new Error(
        `No request script module found matching "${moduleName}"`
      );
    }

    return ModuleImports[moduleName]!.exec();
  }

  private buildContextResponse(
    data: ScriptContextData
  ): ScriptContextResponse | undefined {
    if (data.response) {
      return {
        body: data.response.response.body,
        requestType: data.requestType || RequestType.QUERY,
        responseTime: data.response.meta.responseTime,
        statusCode: data.response.response.status,
        headers: data.response.meta.headers,
      };
    }

    return;
  }
}
