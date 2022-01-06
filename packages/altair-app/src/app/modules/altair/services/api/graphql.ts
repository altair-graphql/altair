import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
import * as ApolloCore from '@apollo/client/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CreateRequestCollectionInput = {
  name: Scalars['String'];
  workspaceId?: InputMaybe<Scalars['String']>;
};

export type CreateRequestInput = {
  collectionId?: InputMaybe<Scalars['String']>;
  headers?: InputMaybe<Array<InputMaybe<HeaderInput>>>;
  name?: InputMaybe<Scalars['String']>;
  ownerId?: InputMaybe<Scalars['String']>;
  query?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
  variables?: InputMaybe<Scalars['String']>;
};

export type CreateUserInput = {
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName?: InputMaybe<Scalars['String']>;
};

export type CreateWorkspaceInput = {
  name: Scalars['String'];
};

export type Header = {
  __typename?: 'Header';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type HeaderInput = {
  key: Scalars['String'];
  value: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createRequest: Request;
  createRequestCollection: RequestCollection;
  createWorkspace: Workspace;
  getOrCreateUser?: Maybe<User>;
  removeRequest?: Maybe<Request>;
  removeRequestCollection?: Maybe<RequestCollection>;
  removeWorkspace?: Maybe<Workspace>;
  updateRequest: Request;
  updateRequestCollection: RequestCollection;
  updateWorkspace: Workspace;
};


export type MutationCreateRequestArgs = {
  createRequestInput: CreateRequestInput;
};


export type MutationCreateRequestCollectionArgs = {
  createRequestCollectionInput: CreateRequestCollectionInput;
};


export type MutationCreateWorkspaceArgs = {
  createWorkspaceInput: CreateWorkspaceInput;
};


export type MutationRemoveRequestArgs = {
  id: Scalars['Int'];
};


export type MutationRemoveRequestCollectionArgs = {
  id: Scalars['Int'];
};


export type MutationRemoveWorkspaceArgs = {
  id: Scalars['String'];
};


export type MutationUpdateRequestArgs = {
  updateRequestInput: UpdateRequestInput;
};


export type MutationUpdateRequestCollectionArgs = {
  updateRequestCollectionInput: UpdateRequestCollectionInput;
};


export type MutationUpdateWorkspaceArgs = {
  updateWorkspaceInput: UpdateWorkspaceInput;
};

export type Query = {
  __typename?: 'Query';
  getUserById?: Maybe<User>;
  profile?: Maybe<User>;
  request?: Maybe<Request>;
  requestCollection?: Maybe<RequestCollection>;
  requestCollections: Array<Maybe<RequestCollection>>;
  requests: Array<Maybe<Request>>;
  workspace?: Maybe<Workspace>;
  workspaces: Array<Maybe<Workspace>>;
};


export type QueryGetUserByIdArgs = {
  id: Scalars['String'];
};


export type QueryRequestArgs = {
  id: Scalars['Int'];
};


export type QueryRequestCollectionArgs = {
  id: Scalars['Int'];
};


export type QueryWorkspaceArgs = {
  id: Scalars['Int'];
};

export type Request = {
  __typename?: 'Request';
  collectionId?: Maybe<Scalars['String']>;
  headers?: Maybe<Array<Maybe<Header>>>;
  name?: Maybe<Scalars['String']>;
  ownerId?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  variables?: Maybe<Scalars['String']>;
};

export type RequestCollection = {
  __typename?: 'RequestCollection';
  name?: Maybe<Scalars['String']>;
  workspaceId?: Maybe<Scalars['String']>;
};

export type UpdateRequestCollectionInput = {
  id: Scalars['Int'];
};

export type UpdateRequestInput = {
  id: Scalars['Int'];
};

export type UpdateWorkspaceInput = {
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['String'];
  lastName?: Maybe<Scalars['String']>;
};

export type Workspace = {
  __typename?: 'Workspace';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type ProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'User', email: string, firstName: string, lastName?: string | null | undefined } | null | undefined };

export type GetOrCreateUserMutationVariables = Exact<{ [key: string]: never; }>;


export type GetOrCreateUserMutation = { __typename?: 'Mutation', getOrCreateUser?: { __typename?: 'User', email: string, firstName: string, lastName?: string | null | undefined } | null | undefined };

export const ProfileDocument = gql`
    query Profile {
  profile {
    email
    firstName
    lastName
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ProfileGQL extends Apollo.Query<ProfileQuery, ProfileQueryVariables> {
    document = ProfileDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetOrCreateUserDocument = gql`
    mutation getOrCreateUser {
  getOrCreateUser {
    email
    firstName
    lastName
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetOrCreateUserGQL extends Apollo.Mutation<GetOrCreateUserMutation, GetOrCreateUserMutationVariables> {
    document = GetOrCreateUserDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }

  type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

  interface WatchQueryOptionsAlone<V>
    extends Omit<ApolloCore.WatchQueryOptions<V>, 'query' | 'variables'> {}
    
  interface QueryOptionsAlone<V>
    extends Omit<ApolloCore.QueryOptions<V>, 'query' | 'variables'> {}
    
  interface MutationOptionsAlone<T, V>
    extends Omit<ApolloCore.MutationOptions<T, V>, 'mutation' | 'variables'> {}
    
  interface SubscriptionOptionsAlone<V>
    extends Omit<ApolloCore.SubscriptionOptions<V>, 'query' | 'variables'> {}

  @Injectable({ providedIn: 'root' })
  export class APIClient {
    constructor(
      private profileGql: ProfileGQL,
      private getOrCreateUserGql: GetOrCreateUserGQL
    ) {}
      
    profile(variables?: ProfileQueryVariables, options?: QueryOptionsAlone<ProfileQueryVariables>) {
      return this.profileGql.fetch(variables, options)
    }
    
    profileWatch(variables?: ProfileQueryVariables, options?: WatchQueryOptionsAlone<ProfileQueryVariables>) {
      return this.profileGql.watch(variables, options)
    }
    
    getOrCreateUser(variables?: GetOrCreateUserMutationVariables, options?: MutationOptionsAlone<GetOrCreateUserMutation, GetOrCreateUserMutationVariables>) {
      return this.getOrCreateUserGql.mutate(variables, options)
    }
  }