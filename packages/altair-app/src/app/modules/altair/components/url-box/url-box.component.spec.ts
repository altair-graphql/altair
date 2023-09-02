import { expect, describe, it } from '@jest/globals';

import { UrlBoxComponent } from './url-box.component';

import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing';
import { MockModule } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OperationDefinitionNode } from 'graphql';

describe('UrlBoxComponent', () => {
  let wrapper: NgxTestWrapper<UrlBoxComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: UrlBoxComponent,
      imports: [MockModule(SharedModule)],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render correctly with queryOperations > 1', async () => {
    wrapper.setProps({
      queryOperations: [
        {
          name: { value: 'operation 1', kind: 'Name' },
        } as OperationDefinitionNode,
        {
          name: { value: 'operation 2', kind: 'Name' },
        } as OperationDefinitionNode,
      ],
    });
    await wrapper.nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('sanitizeUrl', () => {
    it('should add http protocol if missing', () => {
      expect(wrapper.componentInstance.sanitizeUrl('localhost:3000')).toBe(
        'http://localhost:3000'
      );
    });

    it('should not add http protocol if already present', () => {
      expect(
        wrapper.componentInstance.sanitizeUrl('http://localhost:3000')
      ).toBe('http://localhost:3000');
    });

    it('should not add http protocol if url contains https', () => {
      expect(
        wrapper.componentInstance.sanitizeUrl('https://localhost:3000')
      ).toBe('https://localhost:3000');
    });

    it('should not add protocol if url contains variable', () => {
      expect(wrapper.componentInstance.sanitizeUrl('{{url}}/graphql')).toBe(
        '{{url}}/graphql'
      );
    });
  });
});
