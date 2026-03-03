import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AuthorizationOauth2Component } from './authorization-oauth2.component';
import { NotifyService } from 'app/modules/altair/services';
import { Store } from '@ngrx/store';
import { EnvironmentService } from 'app/modules/altair/services/environment/environment.service';
import { MockProvider } from 'ng-mocks';
import {
  OAuth2Type,
  AuthFormat,
  RequestFormat,
} from 'altair-graphql-core/build/oauth2';

describe('AuthorizationOauth2Component', () => {
  let component: AuthorizationOauth2Component;
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

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AuthorizationOauth2Component],
      providers: [
        { provide: NotifyService, useValue: mockNotifyService },
        { provide: EnvironmentService, useValue: mockEnvironmentService },
        MockProvider(Store),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AuthorizationOauth2Component, {
        set: { template: '' },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(AuthorizationOauth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form values', () => {
    const formValue = component.form.value;
    expect(formValue.type).toBe(OAuth2Type.AUTHORIZATION_CODE);
    expect(formValue.clientId).toBe('');
    expect(formValue.clientSecret).toBe('');
    expect(formValue.authFormat).toBe(AuthFormat.IN_BODY);
    expect(formValue.requestFormat).toBe(RequestFormat.FORM);
  });

  describe('getOAuthWindowUrl', () => {
    it('should return oauth window URL', () => {
      const url = component.getOAuthWindowUrl();
      expect(url).toContain('/oauth2');
      expect(url).toContain('sc=');
    });
  });

  describe('getOAuth2Options', () => {
    it('should throw error if type is not set', () => {
      component.form.patchValue({ type: undefined as any });
      expect(() => component.getOAuth2Options()).toThrow('type is required');
    });

    // TODO: Fix this test, the result isnt correct
    it.skip('should return options with hydrated values', () => {
      component.form.patchValue({
        type: OAuth2Type.AUTHORIZATION_CODE,
        clientId: '{{clientId}}',
        clientSecret: '{{clientSecret}}',
        authorizationEndpoint: 'https://example.com/auth',
        tokenEndpoint: 'https://example.com/token',
        scopes: 'read write',
      });

      const options = component.getOAuth2Options() as any;
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
      component.form.patchValue({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        clientId: 'test-client',
      });

      const options = component.getOAuth2Options() as any;
      expect(options.codeVerifier).toBeDefined();
      expect(options.codeVerifier?.length).toBeGreaterThan(0);
    });

    it('should generate state if not provided', () => {
      component.form.patchValue({
        type: OAuth2Type.AUTHORIZATION_CODE,
        clientId: 'test-client',
      });

      const options = component.getOAuth2Options() as any;
      expect(options.state).toBeDefined();
    });
  });

  describe('handleGetAccessToken', () => {
    it('should call getAccessToken and update form on success', async () => {
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
      };
      vi.spyOn(component, 'getAccessToken').mockResolvedValue(
        mockResponse as any
      );

      await component.handleGetAccessToken();

      expect(mockNotifyService.success).toHaveBeenCalledWith(
        'Retrieved access token successfully'
      );
      expect(component.form.value.accessTokenResponse).toEqual(mockResponse);
    });

    it('should call getAccessToken and show error on failure', async () => {
      const mockErrorResponse = {
        error: 'invalid_grant',
        error_description: 'Invalid credentials',
      };
      vi.spyOn(component, 'getAccessToken').mockResolvedValue(
        mockErrorResponse as any
      );

      await component.handleGetAccessToken();

      expect(mockNotifyService.error).toHaveBeenCalledWith(
        'Failed to retrieve access token: Invalid credentials'
      );
    });

    it('should handle error without error_description', async () => {
      const mockErrorResponse = { error: 'invalid_grant' };
      vi.spyOn(component, 'getAccessToken').mockResolvedValue(
        mockErrorResponse as any
      );

      await component.handleGetAccessToken();

      expect(mockNotifyService.error).toHaveBeenCalledWith(
        'Failed to retrieve access token: invalid_grant'
      );
    });
  });
});
