import { Injectable, inject } from '@angular/core';
import {
  IQuery,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { map } from 'rxjs/operators';
import { FullQueryCollection, initializeClient } from '@altairgraphql/api-utils';
import { AccountService } from '../account/account.service';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';
import { QueryItem } from '@altairgraphql/db';
import { environment } from 'environments/environment';
import { WorkspaceId } from 'altair-graphql-core/build/types/state/workspace.interface';

export const apiClient = initializeClient(
  environment.production ? 'production' : 'development'
);
const serverQueryToLocalQuery = (query: QueryItem): IQuery => {
  return {
    ...(query.content as unknown as IQuery),
    id: query.id,
    created_at: +query.createdAt,
    updated_at: +query.updatedAt,
    storageType: 'api',
  };
};
export const serverCollectionToLocalCollection = (
  collection: FullQueryCollection
): IQueryCollection => {
  return {
    id: collection.id,
    title: collection.name,
    queries: collection.queries.map(serverQueryToLocalQuery),
    storageType: 'api',
    workspaceId: collection.workspaceId,
    description: collection.description ?? '',
    preRequest: {
      script: collection.preRequestScript ?? '',
      enabled: collection.preRequestScriptEnabled,
    },
    postRequest: {
      script: collection.postRequestScript ?? '',
      enabled: collection.postRequestScriptEnabled,
    },
    headers: Array.isArray(collection.headers)
      ? (collection.headers as Array<{ key: string; value: string }>)
      : [],
    environmentVariables:
      collection.environmentVariables &&
      typeof collection.environmentVariables === 'object'
        ? (collection.environmentVariables as Record<string, string>)
        : {},
  };
};
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private accountService = inject(AccountService);


  async createQueryCollection(
    queryCollection: CreateDTO<IQueryCollection>,
    parentCollectionId?: string,
    workspaceId?: WorkspaceId,
    teamId?: TeamId
  ) {
    return await apiClient.createQueryCollection({
      name: queryCollection.title,
      teamId: teamId?.value(),
      workspaceId: workspaceId?.value(),
      queries: queryCollection.queries.map((q) => ({
        name: q.windowName,
        content: q,
      })),
      description: queryCollection.description,
      preRequestScript: queryCollection.preRequest?.script,
      preRequestScriptEnabled: queryCollection.preRequest?.enabled,
      postRequestScript: queryCollection.postRequest?.script,
      postRequestScriptEnabled: queryCollection.postRequest?.enabled,
    });
  }

  async createQuery(collectionServerId: string, query: IQuery) {
    return await apiClient.createQuery({
      collectionId: collectionServerId,
      name: query.windowName,
      content: {
        ...query,
      },
    });
  }

  async getQuery(queryServerId: string) {
    const query = await apiClient.getQuery(queryServerId);
    if (!query) {
      return;
    }

    return {
      query: serverQueryToLocalQuery(query),
      collectionId: query.collectionId,
    };
  }

  async updateQuery(queryServerId: string, query: IQuery) {
    return await apiClient.updateQuery(queryServerId, {
      name: query.windowName,
      content: {
        ...query,
      },
    });
  }

  async deleteQuery(queryServerId: string) {
    return await apiClient.deleteQuery(queryServerId);
  }

  async getQueryRevisions(queryServerId: string) {
    return await apiClient.getQueryRevisions(queryServerId);
  }

  async restoreQueryRevision(queryServerId: string, revisionId: string) {
    return await apiClient.restoreQueryRevision(queryServerId, revisionId);
  }

  async updateCollection(
    collectionServerId: string,
    collection: IQueryCollection,
    parentCollectionServerId?: string
  ) {
    return await apiClient.updateCollection(collectionServerId, {
      name: collection.title,

      queries: collection.queries.map((q) => ({
        name: q.windowName,
        content: {
          ...q,
          collectionId: q.collectionId ?? '',
        },
        collectionId: q.collectionId ?? '',
      })),
      description: collection.description,
      preRequestScript: collection.preRequest?.script,
      preRequestScriptEnabled: collection.preRequest?.enabled,
      postRequestScript: collection.postRequest?.script,
      postRequestScriptEnabled: collection.postRequest?.enabled,
      headers: collection.headers,
      environmentVariables: collection.environmentVariables,
    });
  }

  async deleteCollection(collectionServerId: string) {
    return await apiClient.deleteCollection(collectionServerId);
  }

  async getCollection(
    collectionServerId: string
  ): Promise<IQueryCollection | undefined> {
    try {
      const res = await apiClient.getCollection(collectionServerId);
      if (!res) {
        return;
      }

      return serverCollectionToLocalCollection(res);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return;
    }
  }

  async getCollections(): Promise<IQueryCollection[]> {
    const collections = await apiClient.getCollections();
    return collections.map(serverCollectionToLocalCollection);
  }

  // TODO: Handle team collections
  listenForCollectionChanges() {
    return apiClient.listenForEvents().pipe(
      map((x) => {
        return x;
      })
      // takeUntil(this.accountService.observeSignout())
    );
  }

  getQueryShareUrl(queryServerId: string) {
    return apiClient.getQueryShareUrl(queryServerId);
  }
}
