import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';

import * as fromHeader from '../../store/headers/headers.reducer';
import { IDictionary } from 'app/interfaces/shared';

interface ScriptContextHelpers {
  getEnvironment: (key: string) => any;
  setEnvironment: (key: string, value: any) => void;
  getCookie: (key: string) => string;
  request: (arg1: any, arg2: any, arg3: any) => Promise<ArrayBuffer | null>;
}

interface ScriptContextData {
  headers: fromHeader.Header[];
  variables: string;
  query: string;
  environment: IDictionary;
}

interface GlobalHelperContext {
  data: ScriptContextData;
  helpers: ScriptContextHelpers;
}

@Injectable({
  providedIn: 'root'
})
export class PreRequestService {

  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
  ) { }

  async executeScript(script: string, data: ScriptContextData): Promise<any> {
    const Sval: typeof import('sval').default = (await import('sval') as any).default;
    const self = this;
    // deep cloning
    data = JSON.parse(JSON.stringify(data));
    const interpreter = new Sval({
      ecmaVer: 10,
      sandBox: true,
    });
    interpreter.import({
      altair: this.getGlobalContext(data),
    });
    interpreter.run(`
      const program = async() => {
        ${script};
        return altair.data;
      };
      exports.end = program();
    `);

    return interpreter.exports.end
      .then((res: any) => debug.log('interpreter result:', res))
      .then(() => data);
  }

  getGlobalContext(data: ScriptContextData): GlobalHelperContext {
    const self = this;

    return {
      data,
      helpers: {
        getEnvironment: (key: string) => {
          return data.environment[key];
        },
        setEnvironment: (key: string, val: any) => {
          data.environment[key] = val;
        },
        getCookie: (key: string) => {
          return self.cookieService.get(key);
        },
        request: async (arg1: any, arg2: any, arg3: any) => {
          // https://angular.io/api/common/http/HttpClient#request
          try {
            return self.http.request(arg1, arg2, arg3)
              .toPromise();
          } catch (err) {
            return null;
          }
        }
      }
    };
  }
}
