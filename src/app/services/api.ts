
import { throwError as observableThrowError,  Observable } from 'rxjs';

import { map, catchError } from 'rxjs/operators';
import { Headers, Http, Response } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// Import Rx to get all the operators loaded into the file
import 'rxjs/Rx';
// TODO - Check if this is necessary


@Injectable()
export class ApiService {
    headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json'
    });

    api_url = '';

    constructor(private http: HttpClient) {

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
    get(path: string): Observable<any> {
        return this.http.get(`${this.api_url}${path}`, { headers: this.headers })
            .pipe(
                map(this.checkForError),
                catchError(err => observableThrowError(err)),
            );
    }

    post(path: string, body): Observable<any> {
        return this.http.post(`${this.api_url}${path}`, JSON.stringify(body), { headers: this.headers })
            .pipe(
                map(this.checkForError),
                catchError(err => observableThrowError(err)),
            );
    }

    delete(path: string): Observable<any> {
        return this.http.delete(`${this.api_url}${path}`, { headers: this.headers })
            .pipe(
                map(this.checkForError),
                catchError(err => observableThrowError(err)),
            );
    }

    setHeaders(headers) {
        Object.keys(headers)
            .forEach(header => this.headers.set(header, headers[header]));
    }

    setUrl(url) {
        this.api_url = url;
    }
}
