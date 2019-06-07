import { Injectable } from '@angular/core';
import * as SandBoxr from 'sandboxr';
import { parse } from 'acorn';
import { CookieService } from 'ngx-cookie-service';

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
  ) { }

  executeScript(script: string, data: ScriptContextData): Promise<any> {
    const self = this;
    const ast = parse(`${script};altair.data;`);
    data = { ...data };
    const env = this.createEnvironment({
      data,
      helpers: {
        getEnvironment(key: string) {
          return data.environment[key];
        },
        setEnvironment(key: string, val) {
          data.environment[key] = val;
        },
        getCookie(key: string) {
          return self.cookieService.get(key);
        },
      }
    });

    const sandbox = SandBoxr.create(ast);
    const result = sandbox.resolve(env);

    return sandbox.resolve(env).then(() => data);
  }

  private createEnvironment(data: any) {
    const env = SandBoxr.createEnvironment();
    env.init();

    const ContextObject = env.objectFactory.createObject();

    Object.keys(data).forEach(key => {
      this.addProperty(env, ContextObject, key, data[key]);
    });

    env.createVariable('altair').setValue(ContextObject);

    return env;
  }
  private addProperty(env, obj, propertyName, propertyValue) {

    obj.define(
      propertyName,
      this.createWrappedObject(env, propertyValue),
      {
        enumerable: true
      }
    );

    return obj;
  }

  private createWrappedObject(env, obj) {
    const self = this;
    switch (typeof obj) {
      case 'function':
        return env.objectFactory.createFunction(function() {
          const response = obj.apply(
            this.object.toNative(),
            ([].slice.call(arguments)).map(arg => arg.toNative ? arg.toNative() : arg)
          );

          return self.createWrappedObject(env, response);
        });
      case 'boolean':
      case 'number':
      case 'string':
      case 'symbol':
        return env.objectFactory.createPrimitive(obj);
      case 'object':
        if (Array.isArray(obj)) {
          return env.objectFactory.createArray(obj.map(item => this.createWrappedObject(env, item)));
        } else {
          const _obj = env.objectFactory.createObject();
          Object.keys(obj).forEach(key => {
            this.addProperty(env, _obj, key, obj[key]);
          });
          return _obj;
        }
      default:
        return null;
    }
  }
}
