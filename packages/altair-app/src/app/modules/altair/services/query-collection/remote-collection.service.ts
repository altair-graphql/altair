import { Injectable, inject } from '@angular/core';
import {
  IRemoteQuery,
  IQuery,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { ApiService } from '../api/api.service';
import { AccountService } from '../account/account.service';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import { WorkspaceId } from 'altair-graphql-core/build/types/state/workspace.interface';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';
import { LocalCollectionService } from './local-collection.service';

type QueryID = string;

/**
 * Service for managing remote query collections via API
 */
@Injectable({ providedIn: 'root' })
export class RemoteCollectionService {
  private api = inject(ApiService);
  private accountService = inject(AccountService);
  private localCollectionService = inject(LocalCollectionService);

  async createCollection(
    collection: CreateDTO<IQueryCollection> | IQueryCollection,
    workspaceId?: WorkspaceId,
    teamId?: TeamId
  ) {
    if (!(await this.canApplyRemote())) {
      return;
    }

    const res = await this.api.createQueryCollection(
      collection,
      undefined,
      workspaceId,
      teamId
    );

    if (!res) {
      throw new Error('could not create the collection');
    }

    if ('id' in collection) {
      const subcollections = await this.localCollectionService.getSubcollections(
        collection.id
      );
      for (let i = 0; i < subcollections.length; i++) {
        const subcollection = subcollections[i];
        if (subcollection?.id) {
          await this.api.createQueryCollection(
            subcollection,
            res.id,
            workspaceId,
            teamId
          );
        }
      }
    }

    return res.id;
  }

  async addQuery(collectionId: string, query: IQuery | IRemoteQuery) {
    if (!(await this.canApplyRemote())) {
      return;
    }

    const res = await this.api.createQuery(collectionId, query);
    return res?.id;
  }

  async updateQuery(queryId: QueryID, query: IQuery) {
    if (!(await this.canApplyRemote())) {
      return;
    }

    return this.api.updateQuery(queryId, query);
  }

  async deleteQuery(queryId: string) {
    if (!(await this.canApplyRemote())) {
      return;
    }

    return this.api.deleteQuery(queryId);
  }

  async deleteCollection(collectionId: string) {
    if (!(await this.canApplyRemote())) {
      return;
    }

    return this.api.deleteCollection(collectionId);
  }

  async updateCollection(
    collectionId: string,
    modifiedCollection: IQueryCollection
  ) {
    if (!(await this.canApplyRemote())) {
      return;
    }

    return this.api.updateCollection(collectionId, modifiedCollection);
  }

  async getCollectionByID(collectionId: string) {
    if (!(await this.canApplyRemote())) {
      return;
    }

    return this.api.getCollection(collectionId);
  }

  async getAll() {
    if (!(await this.canApplyRemote())) {
      return [];
    }

    return this.api.getCollections();
  }

  private async canApplyRemote() {
    return !!(await this.accountService.getUser());
  }
}
