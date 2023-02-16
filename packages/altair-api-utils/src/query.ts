import { IRemoteQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';

export interface CreateQueryCollectionDto {
  name: string;
  queries?: Omit<CreateQueryDto, 'collectionId'>[];
  teamId?: string;
}

export type UpdateQueryCollectionDto = Partial<CreateQueryCollectionDto>;

export interface CreateQueryDto {
  name: string;
  collectionId: string;
  content: Omit<CreateDTO<IRemoteQuery>, 'gqlSchema' | 'collectionId'>;
}

export type UpdateQueryDto = Partial<CreateQueryDto>;
