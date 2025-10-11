import { Injectable, inject } from '@angular/core';
import { WindowService } from '../window.service';
import { QueryCollectionService } from '../query-collection/query-collection.service';
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
  private windowService = inject(WindowService);
  private collectionService = inject(QueryCollectionService);
  private gqlService = inject(GqlService);
  private environmentService = inject(EnvironmentService);
  private notifyService = inject(NotifyService);


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
      if (await this.trySdlImport(dataStr)) {
        return;
      }
      if (await this.tryQueryImport(dataStr)) {
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

  private async trySdlImport(dataStr: string): Promise<boolean> {
    try {
      const schema = this.gqlService.sdlToSchema(dataStr);
      // Import only schema
      await this.windowService.importWindowData({
        ...this.windowService.getEmptyWindowState(),
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

  private async tryQueryImport(dataStr: string): Promise<boolean> {
    const operations = this.gqlService.getOperations(dataStr);
    if (operations && operations.length) {
      // Import only query
      await this.windowService.importWindowData({
        ...this.windowService.getEmptyWindowState(),
        query: dataStr,
      });
      return true;
    }
    return false;
  }
}
