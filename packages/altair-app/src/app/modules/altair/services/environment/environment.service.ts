import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { v4 as uuid } from 'uuid';
import { get } from 'object-path';

import { IDictionary } from '../../interfaces/shared';
import * as environmentsActions from '../../store/environments/environments.action';
import {
  EnvironmentState,
  EnvironmentsState,
  ExportEnvironmentState,
  IEnvironment,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import { merge } from 'lodash-es';
import { downloadJson } from '../../utils';
import { NotifyService } from '../notify/notify.service';
import { getActiveEnvironment } from '../../store/environments/utils';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

// Unfortunately, Safari doesn't support lookbehind in regex: https://caniuse.com/js-regexp-lookbehind
// So have to go with an alternative approach using lookahead instead
// export const VARIABLE_REGEX = /(?<!\\){{\s*[\w\.]+\s*}}/g;
export const VARIABLE_REGEX = /(^{{\s*[\w.]+\s*}})|((?!\\)(.){{\s*[\w.]+\s*}})/g;

interface HydrateEnvironmentOptions {
  activeEnvironment?: IEnvironment;
}

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private notifyService = inject(NotifyService);
  private store = inject<Store<RootState>>(Store);

  environmentsState?: EnvironmentsState;

  constructor() {
    this.store.subscribe({
      next: (data) => {
        this.environmentsState = data.environments;
      },
    });
  }

  getActiveEnvironment(windowCollections?: IQueryCollection[]): IEnvironment {
    if (!this.environmentsState) {
      return {};
    }

    return getActiveEnvironment(this.environmentsState, windowCollections);
  }

  mergeWithActiveEnvironment(
    environment: IEnvironment,
    windowCollections?: IQueryCollection[]
  ) {
    return this.mergeEnvironments(
      this.getActiveEnvironment(windowCollections),
      environment
    );
  }

  mergeEnvironments(env1: IEnvironment, env2: IEnvironment) {
    return merge(env1, env2);
  }

  /**
   * Update all variables in content with values from the environment variables.
   * Variables are written with double curly braces .e.g. {{ VARIABLE_ONE }}
   * @param content {string}
   */
  hydrate(content: string, options: HydrateEnvironmentOptions = {}): string {
    if (!content) {
      return content;
    }

    const activeEnvironment = options.activeEnvironment
      ? options.activeEnvironment
      : this.getActiveEnvironment();

    const escaped: IDictionary = {};
    // Keep escaped variable regex aside, replacing with non-variable values
    content = content.replace(/\\{{\s*[\w.]+\s*}}/g, (match) => {
      const escapedId = uuid();
      // remove the escape character when hydrating
      escaped[escapedId] = match.replace(/^\\/, '');
      return `[[${escapedId}]]`;
    });

    // Replace variable regex
    content = content.replace(/{{\s*[\w.]+\s*}}/g, (match) => {
      const matches = match.match(/[\w.]+/);
      if (matches) {
        const variable = matches[0];
        if (!variable) {
          return '';
        }
        if (activeEnvironment[variable]) {
          return activeEnvironment[variable];
        }

        // retrieve value given object path
        return get(activeEnvironment, variable) || '';
      }
      return match;
    });

    // Replace escaped variable values back
    Object.keys(escaped).forEach((escapedId) => {
      content = content.split(`[[${escapedId}]]`).join(escaped[escapedId]);
    });

    return content;
  }

  hydrateHeaders(
    headers: HeaderState,
    options: HydrateEnvironmentOptions = {}
  ): HeaderState {
    const hydratedHeaders = headers.map((header) => {
      return {
        key: this.hydrate(header.key, options),
        value: this.hydrate(header.value, options),
        enabled: header.enabled,
      };
    });

    const activeEnvironment = options.activeEnvironment
      ? options.activeEnvironment
      : this.getActiveEnvironment();

    const environmentHeadersMap = activeEnvironment.headers;

    if (environmentHeadersMap) {
      const environmentHeaders = Object.keys(environmentHeadersMap).map((key) => {
        return {
          key: this.hydrate(key, options),
          value: this.hydrate(environmentHeadersMap[key] || '', options),
          enabled: true,
        };
      });
      return [...environmentHeaders, ...hydratedHeaders];
    }
    return hydratedHeaders;
  }

  importEnvironmentData(data: ExportEnvironmentState) {
    if (!data.version || !data.type || data.type !== 'environment') {
      throw new Error('File is not a valid Altair environment file.');
    }

    const id = uuid();
    this.store.dispatch(
      new environmentsActions.AddSubEnvironmentAction({
        ...data,
        id,
      })
    );
    this.notifyService.success(
      `${data.title ?? 'New'} environment imported successfully`
    );
  }

  exportEnvironmentData(environment: EnvironmentState) {
    return downloadJson(
      this.getExportEnvironmentData(environment),
      `${environment.title}_exported`,
      {
        fileType: 'agx',
      }
    );
  }

  getExportEnvironmentData(environment: EnvironmentState): ExportEnvironmentState {
    const exportCollectionData: ExportEnvironmentState = {
      version: 1,
      type: 'environment',
      id: environment.id,
      title: environment.title,
      variables: JSON.parse(environment.variablesJson),
    };
    return exportCollectionData;
  }
}
