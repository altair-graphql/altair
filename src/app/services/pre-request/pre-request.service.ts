import { Injectable } from '@angular/core';
import Sval from 'sval';
import { CookieService } from 'ngx-cookie-service';
import { debug } from '../../utils/logger';
import { HttpClient } from '@angular/common/http';

interface ScriptContextData {
  headers;
  variables;
  query;
  environment;
}

@Injectable({
  providedIn: 'root'
})
export class PreRequestService {

  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
  ) { }

  executeScript(script: string, data: ScriptContextData): Promise<any> {
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
          request(arg1, arg2, arg3) {
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
      .then(res => debug.log('interpreter result:', res))
      .then(() => data);
  }
}
