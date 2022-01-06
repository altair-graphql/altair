
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class HeaderInput {
    key: string;
    value: string;
}

export class CreateRequestInput {
    name: string;
    url?: Nullable<string>;
    query: string;
    headers?: Nullable<Nullable<HeaderInput>[]>;
    variables?: Nullable<string>;
    workspace?: Nullable<string>;
}

export class UpdateRequestInput {
    id: number;
}

export class CreateUserInput {
    email: string;
    firstName: string;
    lastName?: Nullable<string>;
}

export class CreateWorkspaceInput {
    name: string;
}

export class UpdateWorkspaceInput {
    id: string;
    name?: Nullable<string>;
}

export class Request {
    ownerId: string;
    name?: Nullable<string>;
    url?: Nullable<string>;
    query?: Nullable<string>;
    headers?: Nullable<Nullable<Header>[]>;
    variables?: Nullable<string>;
    collectionId?: Nullable<string>;
}

export class Header {
    key: string;
    value: string;
}

export abstract class IQuery {
    abstract requests(): Nullable<Request>[] | Promise<Nullable<Request>[]>;

    abstract request(id: number): Nullable<Request> | Promise<Nullable<Request>>;

    abstract getUserById(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract profile(): Nullable<User> | Promise<Nullable<User>>;

    abstract workspaces(): Nullable<Workspace>[] | Promise<Nullable<Workspace>[]>;

    abstract workspace(id: number): Nullable<Workspace> | Promise<Nullable<Workspace>>;
}

export abstract class IMutation {
    abstract createRequest(createRequestInput: CreateRequestInput): Request | Promise<Request>;

    abstract updateRequest(updateRequestInput: UpdateRequestInput): Request | Promise<Request>;

    abstract removeRequest(id: number): Nullable<Request> | Promise<Nullable<Request>>;

    abstract getOrCreateUser(): Nullable<User> | Promise<Nullable<User>>;

    abstract createWorkspace(createWorkspaceInput: CreateWorkspaceInput): Workspace | Promise<Workspace>;

    abstract updateWorkspace(updateWorkspaceInput: UpdateWorkspaceInput): Workspace | Promise<Workspace>;

    abstract removeWorkspace(id: string): Nullable<Workspace> | Promise<Nullable<Workspace>>;
}

export class User {
    id: string;
    email: string;
    firstName: string;
    lastName?: Nullable<string>;
}

export class Workspace {
    id?: Nullable<string>;
    name?: Nullable<string>;
}

type Nullable<T> = T | null;
