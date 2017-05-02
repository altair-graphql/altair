import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';

export interface Memory {
    title: string;
    content: string;
}

export interface User {
    id?: string;
}

export interface Header {
    key: string;
    value: string;
}

export interface State {
    apiUrl: string;
    query: string;
    queryResult: string;
    showHeaderDialog: boolean;
    showResult: boolean;
    headers: Array<Header>;
    variables: Array<any>;
    introspectionResult: object;
    gqlSchema: object;
}

const defaultState: State = {
    apiUrl: '',
    query: '',
    queryResult: '',
    showHeaderDialog: false,
    showResult: true,
    headers: [
        {key: '', value: ''},
        {key: '', value: ''},
        {key: '', value: ''},
    ],
    variables: [
        {key: '', value: ''},
    ],
    introspectionResult: {},
    gqlSchema: null
};

const _store = new BehaviorSubject<State>(defaultState);

@Injectable()
export class Store {
    private store = _store;
    changes = this.store.asObservable().distinctUntilChanged();

    setState(state: State) {
        this.store.next(state);
    }

    getState(): State {
        return this.store.value;
    }

    purge() {
        this.store.next(defaultState);
    }
}
