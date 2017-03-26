import { Headers, Http, Response } from '@angular/http';
import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
// Import Rx to get all the operators loaded into the file
import 'rxjs/Rx';
// TODO - Check if this is necessary
import 'rxjs/add/observable/throw';

@Injectable()
export class ApiService {
    headers: Headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json'
    });

    api_url = 'https://api.konga.com/v1/graphql';

    constructor(private http: Http){

    }

    private getJson(res: Response) {
        return res.json();
    }

    private checkForError(res: Response): Response {
        if (res.status >= 200 && res.status < 300) {
            return res;
        } else {
            const err = new Error(res.statusText);
            err['response'] = res;
            console.error(err);
            throw err;
        }
    }
    get(path: string): Observable<any>{
        return this.http.get(`${this.api_url}${path}`, { headers: this.headers })
            .map(this.checkForError)
            .catch(err => Observable.throw(err))
            .map(this.getJson);
    }

    post(path: string, body): Observable<any>{
        return this.http.post(`${this.api_url}${path}`, JSON.stringify(body), { headers: this.headers })
            .map(this.checkForError)
            .catch(err => Observable.throw(err))
            .map(this.getJson);
    }

    delete(path: string): Observable<any>{
        return this.http.delete(`${this.api_url}${path}`, { headers: this.headers })
            .map(this.checkForError)
            .catch(err => Observable.throw(err))
            .map(this.getJson);
    }

    setHeaders(headers){
        Object.keys(headers)
            .forEach(header => this.headers.set(header, headers[header]));
    }

    setUrl(url){
        this.api_url = url;
    }
}
