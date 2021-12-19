
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class CreateRequestCollectionInput {
    name: string;
    workspaceId?: Nullable<string>;
}

export class UpdateRequestCollectionInput {
    id: number;
}

export class HeaderInput {
    key: string;
    value: string;
}

export class CreateRequestInput {
    name?: Nullable<string>;
    url?: Nullable<string>;
    query?: Nullable<string>;
    headers?: Nullable<Nullable<HeaderInput>[]>;
    variables?: Nullable<string>;
    collectionId?: Nullable<string>;
    ownerId?: Nullable<string>;
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

export class LoginResponse {
    accessToken?: Nullable<string>;
}

export abstract class IMutation {
    abstract login(username: string, password: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;

    abstract registerUser(input: CreateUserInput, password: string): Nullable<User> | Promise<Nullable<User>>;

    abstract createRequestCollection(createRequestCollectionInput: CreateRequestCollectionInput): RequestCollection | Promise<RequestCollection>;

    abstract updateRequestCollection(updateRequestCollectionInput: UpdateRequestCollectionInput): RequestCollection | Promise<RequestCollection>;

    abstract removeRequestCollection(id: number): Nullable<RequestCollection> | Promise<Nullable<RequestCollection>>;

    abstract createRequest(createRequestInput: CreateRequestInput): Request | Promise<Request>;

    abstract updateRequest(updateRequestInput: UpdateRequestInput): Request | Promise<Request>;

    abstract removeRequest(id: number): Nullable<Request> | Promise<Nullable<Request>>;

    abstract createWorkspace(createWorkspaceInput: CreateWorkspaceInput): Workspace | Promise<Workspace>;

    abstract updateWorkspace(updateWorkspaceInput: UpdateWorkspaceInput): Workspace | Promise<Workspace>;

    abstract removeWorkspace(id: string): Nullable<Workspace> | Promise<Nullable<Workspace>>;
}

export class RequestCollection {
    name?: Nullable<string>;
    workspaceId?: Nullable<string>;
}

export abstract class IQuery {
    abstract requestCollections(): Nullable<RequestCollection>[] | Promise<Nullable<RequestCollection>[]>;

    abstract requestCollection(id: number): Nullable<RequestCollection> | Promise<Nullable<RequestCollection>>;

    abstract requests(): Nullable<Request>[] | Promise<Nullable<Request>[]>;

    abstract request(id: number): Nullable<Request> | Promise<Nullable<Request>>;

    abstract getUserById(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract workspaces(): Nullable<Workspace>[] | Promise<Nullable<Workspace>[]>;

    abstract workspace(id: number): Nullable<Workspace> | Promise<Nullable<Workspace>>;
}

export class Request {
    name?: Nullable<string>;
    url?: Nullable<string>;
    query?: Nullable<string>;
    headers?: Nullable<Nullable<Header>[]>;
    variables?: Nullable<string>;
    collectionId?: Nullable<string>;
    ownerId?: Nullable<string>;
}

export class Header {
    key: string;
    value: string;
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
