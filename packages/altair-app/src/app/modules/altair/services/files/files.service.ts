import { Injectable } from '@angular/core';
import { WindowService } from '../window.service';
import { QueryCollectionService } from '../query-collection/query-collection.service';
import { ExportWindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { getFileStr } from '../../utils';
import { NotifyService } from '../notify/notify.service';
import { GqlService } from '../gql/gql.service';
import { debug } from '../../utils/logger';
import { EnvironmentService } from '../environment/environment.service';
import { AltairFile } from './types';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  constructor(
    private windowService: WindowService,
    private collectionService: QueryCollectionService,
    private gqlService: GqlService,
    private environmentService: EnvironmentService,
    private notifyService: NotifyService
  ) {}

  async handleImportedFile(file: File) {
    const dataStr = await getFileStr(file);

    try {
      const parsed = this.parseAsJson(dataStr);

      switch (parsed.type) {
        case 'window':
          if (parsed.version === 1) {
            return this.windowService.importWindowData(parsed, {
              fixedTitle: true,
            });
          }
          throw new Error('Invalid Altair window file.');
        case 'collection':
          if (parsed.version === 1) {
            return this.collectionService.importCollectionData(parsed);
          }
          throw new Error('Invalid Altair collection file.');
        case 'environment':
          if (parsed.version === 1) {
            return this.environmentService.importEnvironmentData(parsed);
          }
          throw new Error('Invalid Altair environment file.');
        default:
          throw new Error('Invalid Altair file.');
      }
    } catch (err) {
      // If not JSON, try other formats..
      if (this.trySdlImport(dataStr)) {
        return;
      }
      if (this.tryQueryImport(dataStr)) {
        return;
      }
      debug.log('Invalid Altair window file.', err);
      this.notifyService.error('Invalid Altair file.');
      throw err;
    }
  }

  private parseAsJson(dataStr: string): AltairFile {
    try {
      return JSON.parse(dataStr) as AltairFile;
    } catch (err) {
      return JSON.parse(decodeURIComponent(dataStr)) as AltairFile;
    }
  }

  private trySdlImport(dataStr: string): boolean {
    const emptyWindowData: ExportWindowState = {
      version: 1,
      type: 'window',
      apiUrl: '',
      headers: [],
      preRequestScript: '',
      preRequestScriptEnabled: false,
      query: '',
      subscriptionUrl: '',
      subscriptionConnectionParams: '',
      variables: '{}',
      windowName: '',
    };
    try {
      const schema = this.gqlService.sdlToSchema(dataStr);
      // Import only schema
      this.windowService.importWindowData({
        ...emptyWindowData,
        version: 1,
        type: 'window',
        gqlSchema: schema,
      });
      this.notifyService.success(
        'Successfully imported GraphQL schema. Open the docs section to view it.'
      );
      return true;
    } catch (sdlError) {
      return false;
    }
  }

  private tryQueryImport(dataStr: string): boolean {
    const emptyWindowData: ExportWindowState = {
      version: 1,
      type: 'window',
      apiUrl: '',
      headers: [],
      preRequestScript: '',
      preRequestScriptEnabled: false,
      query: '',
      subscriptionUrl: '',
      subscriptionConnectionParams: '',
      variables: '{}',
      windowName: '',
    };
    const operations = this.gqlService.getOperations(dataStr);
    if (operations && operations.length) {
      // Import only query
      this.windowService.importWindowData({
        ...emptyWindowData,
        version: 1,
        type: 'window',
        query: dataStr,
      });
      return true;
    }
    return false;
  }
}
