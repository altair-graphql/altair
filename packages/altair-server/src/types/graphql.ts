
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class CreateUserInput {
    email: string;
    firstName: string;
    lastName?: Nullable<string>;
}

export class CreateWorkspaceInput {
    exampleField?: Nullable<number>;
}

export class UpdateWorkspaceInput {
    id: number;
}

export class User {
    id: string;
    email: string;
    firstName: string;
    lastName?: Nullable<string>;
}

export abstract class IQuery {
    abstract getUserById(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract workspaces(): Nullable<Workspace>[] | Promise<Nullable<Workspace>[]>;

    abstract workspace(id: number): Nullable<Workspace> | Promise<Nullable<Workspace>>;
}

export abstract class IMutation {
    abstract createUser(input: CreateUserInput): Nullable<User> | Promise<Nullable<User>>;

    abstract createWorkspace(createWorkspaceInput: CreateWorkspaceInput): Workspace | Promise<Workspace>;

    abstract updateWorkspace(updateWorkspaceInput: UpdateWorkspaceInput): Workspace | Promise<Workspace>;

    abstract removeWorkspace(id: number): Nullable<Workspace> | Promise<Nullable<Workspace>>;
}

export class Workspace {
    exampleField?: Nullable<number>;
}

type Nullable<T> = T | null;
