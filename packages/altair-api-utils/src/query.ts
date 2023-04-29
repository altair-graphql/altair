import { IRemoteQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';

export type IQueryContentDto = Omit<
  CreateDTO<IRemoteQuery>,
  'gqlSchema' | 'collectionId'
>;
export interface ICreateQueryCollectionDto {
  name: string;
  queries?: Omit<ICreateQueryDto, 'collectionId'>[];
  workspaceId?: string;
  teamId?: string;
}

export type IUpdateQueryCollectionDto = Partial<ICreateQueryCollectionDto>;

export interface ICreateQueryDto {
  name: string;
  collectionId: string;
  content: IQueryContentDto;
}

export type IUpdateQueryDto = Partial<ICreateQueryDto>;
