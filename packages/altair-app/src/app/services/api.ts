
import { throwError as observableThrowError,  Observable } from 'rxjs';

import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { debug } from 'app/utils/logger';
import { IDictionary } from 'app/interfaces/shared';


@Injectable()
export class ApiService {
    headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json'
    });

    api_url = '';

    constructor(private http: HttpClient) {

    }

    private checkForError(res: Response): Response {
        if (res.status >= 200 && res.status < 300) {
            return res;
        } else {
            const err = new Error(res.statusText as string);
            (err as any).response = res;
            debug.error(err);
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

    post(path: string, body: any): Observable<any> {
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

    setHeaders(headers: IDictionary<string>) {
        Object.keys(headers)
            .forEach(header => this.headers.set(header, headers[header]));
    }

    setUrl(url: string) {
        this.api_url = url;
    }
}
