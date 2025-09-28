import { IRemoteQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';

export type IQueryContentDto = Omit<
  CreateDTO<IRemoteQuery>,
  'gqlSchema' | 'collectionId'
> & {
  // redefine the authorizationData type to be more flexible, to support prisma's JSON type
  authorizationData?: any;
};
export interface ICreateQueryCollectionDto {
  name: string;
  queries?: Omit<ICreateQueryDto, 'collectionId'>[];
  workspaceId?: string;
  teamId?: string;
  description?: string;
  preRequestScript?: string;
  preRequestScriptEnabled?: boolean;
  postRequestScript?: string;
  postRequestScriptEnabled?: boolean;
  headers?: HeaderState;
  variables?: string;
}

export type IUpdateQueryCollectionDto = Partial<ICreateQueryCollectionDto>;

export interface ICreateQueryDto {
  name: string;
  collectionId: string;
  content: IQueryContentDto;
}

export type IUpdateQueryDto = Partial<ICreateQueryDto>;
