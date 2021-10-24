import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import uuid from 'uuid/v4';
import { get } from 'object-path';

import * as fromRoot from '../../store';
import * as fromEnvironments from '../../store/environments/environments.reducer';
import * as fromHeaders from '../../store/headers/headers.reducer';
import { IDictionary } from '../../interfaces/shared';
import { EnvironmentsState } from 'altair-graphql-core/build/types/state/environments.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';

// Unfortunately, Safari doesn't support lookbehind in regex: https://caniuse.com/js-regexp-lookbehind
// So have to go with an alternative approach using lookahead instead
// export const VARIABLE_REGEX = /(?<!\\){{\s*[\w\.]+\s*}}/g;
export const VARIABLE_REGEX = /(^{{\s*[\w\.]+\s*}})|((?!\\)(.){{\s*[\w\.]+\s*}})/g;
interface IEnvironment extends IDictionary<any> {
  headers?: IDictionary<string>;
}
interface HydrateEnvironmentOptions {
  activeEnvironment?: IEnvironment;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  environmentsState: EnvironmentsState;

  constructor(
    private store: Store<RootState>
  ) {
    this.store.subscribe({
      next: data => {
        this.environmentsState = data.environments;
      },
    });
  }

  getActiveEnvironment(): IEnvironment {
    let baseEnvironment = {};
    let subEnvironment = {};

    try {
      baseEnvironment = JSON.parse(this.environmentsState.base.variablesJson);
    } catch (ex) {}

    if (this.environmentsState.activeSubEnvironment) {
      const activeSubEnvState = this.environmentsState.subEnvironments.find(env => {
        return env.id === this.environmentsState.activeSubEnvironment;
      });

      if (activeSubEnvState) {
        try {
          subEnvironment = JSON.parse(activeSubEnvState.variablesJson);
        } catch (ex) {}
      }
    }

    return { ...baseEnvironment, ...subEnvironment };
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

    const activeEnvironment = options.activeEnvironment ? options.activeEnvironment : this.getActiveEnvironment();

    const escaped: IDictionary = {};
    // Keep escaped variable regex aside, replacing with non-variable values
    content = content.replace(/\\{{\s*[\w\.]+\s*}}/g, (match) => {
      const escapedId = uuid();
      // remove the escape character when hydrating
      escaped[escapedId] = match.replace(/^\\/, '');
      return `[[${escapedId}]]`;
    });

    // Replace variable regex
    content = content.replace(/{{\s*[\w\.]+\s*}}/g, (match) => {
      const matches = match.match(/[\w\.]+/);
      if (matches) {
        const variable = matches[0];
        if (activeEnvironment[variable]) {
          return activeEnvironment[variable];
        }

        // retrieve value given object path
        return get(activeEnvironment, variable) || '';
      }
      return match;
    });

    // Replace escaped variable values back
    Object.keys(escaped).forEach(escapedId => {
      content = content.split(`[[${escapedId}]]`).join(escaped[escapedId]);
    });

    return content;
  }

  hydrateHeaders(headers: HeaderState, options: HydrateEnvironmentOptions = {}): HeaderState {
    const hydratedHeaders = headers.map(header => {
      return {
        key: this.hydrate(header.key, options),
        value: this.hydrate(header.value, options),
        enabled: header.enabled,
      };
    });

    const activeEnvironment = options.activeEnvironment ? options.activeEnvironment : this.getActiveEnvironment();

    const environmentHeadersMap = activeEnvironment.headers;

    if (environmentHeadersMap) {
      const environmentHeaders = Object.keys(environmentHeadersMap).map(key => {
        return {
          key: this.hydrate(key, options),
          value: this.hydrate(environmentHeadersMap[key], options),
          enabled: true,
        }
      });

      return [ ...environmentHeaders, ...hydratedHeaders ];
    }

    return hydratedHeaders;
  }
}
