import { FormsModule } from '@angular/forms';

import { AuthorizationOauth2Component } from './authorization-oauth2.component';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';
import { MockModule, MockProvider } from 'ng-mocks';
import { ComponentModule } from '../../components.module';
import { NotifyService } from 'app/modules/altair/services';
import { Store } from '@ngrx/store';
import { EnvironmentService } from 'app/modules/altair/services/environment/environment.service';
import { mount } from 'testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';
import {
  OAuth2Type,
  AuthFormat,
  RequestFormat,
} from 'altair-graphql-core/build/oauth2';

describe('AuthorizationOauth2Component', () => {
  let wrapper: NgxTestWrapper<AuthorizationOauth2Component>;
  let mockNotifyService: any;
  let mockEnvironmentService: any;

  beforeEach(async () => {
    mockNotifyService = {
      success: vi.fn(),
      error: vi.fn(),
    };
    mockEnvironmentService = {
      hydrate: vi.fn((val: string) => val),
    };

    wrapper = await mount({
      component: AuthorizationOauth2Component,
      imports: [MockModule(SharedModule), MockModule(ComponentModule), FormsModule],
      providers: [
        { provide: NotifyService, useValue: mockNotifyService },
        { provide: EnvironmentService, useValue: mockEnvironmentService },
        MockProvider(Store),
      ],
    });
  });

  it('should create', () => {
    expect(wrapper.component).toBeTruthy();
  });

  it('should have default form values', () => {
    const formValue = wrapper.componentInstance.form.value;
    expect(formValue.type).toBe(OAuth2Type.AUTHORIZATION_CODE);
    expect(formValue.clientId).toBe('');
    expect(formValue.clientSecret).toBe('');
    expect(formValue.authFormat).toBe(AuthFormat.IN_BODY);
    expect(formValue.requestFormat).toBe(RequestFormat.FORM);
  });

  describe('getOAuthWindowUrl', () => {
    it('should return oauth window URL', () => {
      const url = wrapper.componentInstance.getOAuthWindowUrl();
      expect(url).toContain('/oauth2');
      expect(url).toContain('sc=');
    });
  });

  describe('getOAuth2Options', () => {
    it('should throw error if type is not set', () => {
      wrapper.componentInstance.form.patchValue({ type: undefined as any });
      expect(() => wrapper.componentInstance.getOAuth2Options()).toThrow(
        'type is required'
      );
    });

    // TODO: Fix this test, the result isnt correct
    it.skip('should return options with hydrated values', () => {
      wrapper.componentInstance.form.patchValue({
        type: OAuth2Type.AUTHORIZATION_CODE,
        clientId: '{{clientId}}',
        clientSecret: '{{clientSecret}}',
        authorizationEndpoint: 'https://example.com/auth',
        tokenEndpoint: 'https://example.com/token',
        scopes: 'read write',
      });

      const options = wrapper.componentInstance.getOAuth2Options() as any;
      expect(options.type).toBe(OAuth2Type.AUTHORIZATION_CODE);
      expect(options.clientId).toBe('{{clientId}}');
      expect(options.clientSecret).toBe('{{clientSecret}}');
      expect(options.authorizationEndpoint).toBe('https://example.com/auth');
      expect(options.tokenEndpoint).toBe('https://example.com/token');
      expect(options.scopes).toEqual(['read', 'write']);
      expect(options.authFormat).toBe(AuthFormat.IN_BODY);
      expect(options.requestFormat).toBe(RequestFormat.FORM);
    });

    it('should generate codeVerifier if not provided', () => {
      wrapper.componentInstance.form.patchValue({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        clientId: 'test-client',
      });

      const options = wrapper.componentInstance.getOAuth2Options() as any;
      expect(options.codeVerifier).toBeDefined();
      expect(options.codeVerifier?.length).toBeGreaterThan(0);
    });

    it('should generate state if not provided', () => {
      wrapper.componentInstance.form.patchValue({
        type: OAuth2Type.AUTHORIZATION_CODE,
        clientId: 'test-client',
      });

      const options = wrapper.componentInstance.getOAuth2Options() as any;
      expect(options.state).toBeDefined();
    });
  });

  describe('handleGetAccessToken', () => {
    it('should call getAccessToken and update form on success', async () => {
      const mockResponse = { access_token: 'test-token', token_type: 'Bearer' };
      vi
        .spyOn(wrapper.componentInstance, 'getAccessToken')
        .mockResolvedValue(mockResponse as any);

      await wrapper.componentInstance.handleGetAccessToken();

      expect(mockNotifyService.success).toHaveBeenCalledWith(
        'Retrieved access token successfully'
      );
      expect(wrapper.componentInstance.form.value.accessTokenResponse).toEqual(
        mockResponse
      );
    });

    it('should call getAccessToken and show error on failure', async () => {
      const mockErrorResponse = {
        error: 'invalid_grant',
        error_description: 'Invalid credentials',
      };
      vi
        .spyOn(wrapper.componentInstance, 'getAccessToken')
        .mockResolvedValue(mockErrorResponse as any);

      await wrapper.componentInstance.handleGetAccessToken();

      expect(mockNotifyService.error).toHaveBeenCalledWith(
        'Failed to retrieve access token: Invalid credentials'
      );
    });

    it('should handle error without error_description', async () => {
      const mockErrorResponse = { error: 'invalid_grant' };
      vi
        .spyOn(wrapper.componentInstance, 'getAccessToken')
        .mockResolvedValue(mockErrorResponse as any);

      await wrapper.componentInstance.handleGetAccessToken();

      expect(mockNotifyService.error).toHaveBeenCalledWith(
        'Failed to retrieve access token: invalid_grant'
      );
    });
  });

  describe('emit authDataChange', () => {
    it('should emit authDataChange when form values change', async () => {
      wrapper.componentInstance.form.patchValue({ clientId: 'new-client-id' });
      await wrapper.nextTick();

      expect(wrapper.emitted('authDataChange')).toBeTruthy();
    });
  });
});
