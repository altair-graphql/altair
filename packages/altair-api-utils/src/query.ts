import { IRemoteQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';

export interface CreateQueryCollectionDto {
  name: string;
  queries?: CreateQueryDto[];
}

export type UpdateQueryCollectionDto = Partial<CreateQueryCollectionDto>;

export interface CreateQueryDto {
  name: string;
  collectionId: string;
  content: Omit<CreateDTO<IRemoteQuery>, 'gqlSchema'>;
}

export type UpdateQueryDto = Partial<CreateQueryDto>;
