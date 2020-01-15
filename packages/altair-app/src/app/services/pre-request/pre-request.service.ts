import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';

import * as fromHeader from '../../reducers/headers/headers';

interface ScriptContextData {
  headers: fromHeader.Header[];
  variables: string;
  query: string;
  environment: any;
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
    const Sval = (await import('sval') as any).default;
    const self = this;
    // deep cloning
    data = JSON.parse(JSON.stringify(data));
    const interpreter = new Sval({
      ecmaVer: 10,
      sandBox: true,
    });
    interpreter.import({
      altair: {
        data,
        helpers: {
          getEnvironment(key: string) {
            return data.environment[key];
          },
          setEnvironment(key: string, val: any) {
            data.environment[key] = val;
          },
          getCookie(key: string) {
            return self.cookieService.get(key);
          },
          request(arg1: any, arg2: any, arg3: any) {
            // https://angular.io/api/common/http/HttpClient#request
            return self.http.request(arg1, arg2, arg3)
              .toPromise()
              .catch(() => null);
          }
        }
      }
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
}
