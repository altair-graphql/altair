import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthLoginTransactionService } from './oauth-login-transaction.service';
import { PasswordService } from './password/password.service';
import { mockRequest, mockResponse } from './mocks/express.mock';
import { mockUser } from './mocks/prisma-service.mock';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { testProviders } from 'test/providers';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let oauthLoginTransactionService: {
    complete: ReturnType<typeof vi.fn>;
    redeem: ReturnType<typeof vi.fn>;
    isAllowedRedirectOrigin: ReturnType<typeof vi.fn>;
  };

  const tokenMock = 'token';

  beforeEach(async () => {
    oauthLoginTransactionService = {
      complete: vi.fn(),
      redeem: vi.fn(),
      isAllowedRedirectOrigin: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        ...testProviders,
        PrismaService,
        PasswordService,
        ConfigService,
        {
          provide: OAuthLoginTransactionService,
          useValue: oauthLoginTransactionService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleSigninCallback', () => {
    it('should redirect with a one-time handoff code', async () => {
      const user = mockUser();
      const requestMock = mockRequest({
        user,
        query: { state: 'opaque-state' },
        headers: {
          cookie: 'altair_oauth_transaction=browser-binding=with=equals',
        },
      });
      const responseMock = mockResponse({
        redirect: vi.fn(),
        clearCookie: vi.fn(),
      });
      vi.spyOn(authService, 'googleLogin').mockReturnValueOnce(user);
      oauthLoginTransactionService.complete.mockResolvedValueOnce({
        handoffCode: 'one-time-code',
        redirectUrl: 'https://redir.altairgraphql.dev/?nonce=nonce',
      });

      await controller.googleSigninCallback(requestMock, responseMock);

      expect(oauthLoginTransactionService.complete).toHaveBeenCalledWith(
        'GOOGLE',
        'opaque-state',
        'browser-binding=with=equals',
        user.id
      );
      expect(responseMock.redirect).toHaveBeenCalledWith(
        'https://redir.altairgraphql.dev/?nonce=nonce&handoff_code=one-time-code'
      );
      expect(responseMock.clearCookie).toHaveBeenCalledWith(
        'altair_oauth_transaction'
      );
    });

    it('should reject a callback without the browser-bound transaction', async () => {
      const requestMock = mockRequest({
        user: mockUser(),
        query: { state: 'opaque-state' },
      });
      vi.spyOn(authService, 'googleLogin').mockReturnValueOnce(mockUser());

      await expect(
        controller.googleSigninCallback(requestMock, mockResponse())
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('redeemOAuthHandoff', () => {
    it('should reject a handoff request from an untrusted origin', async () => {
      oauthLoginTransactionService.isAllowedRedirectOrigin.mockReturnValue(false);

      await expect(
        controller.redeemOAuthHandoff(
          { handoffCode: 'one-time-code', codeVerifier: 'code-verifier' },
          mockRequest({ headers: { origin: 'https://attacker.example' } })
        )
      ).rejects.toThrow('OAuth handoff origin not allowed');
      expect(oauthLoginTransactionService.redeem).not.toHaveBeenCalled();
    });

    it('should return newly generated tokens for a valid handoff code', async () => {
      const user = mockUser();
      oauthLoginTransactionService.isAllowedRedirectOrigin.mockReturnValue(true);
      oauthLoginTransactionService.redeem.mockResolvedValue(user.id);
      vi.spyOn(authService, 'generateTokens').mockReturnValue({
        accessToken: tokenMock,
        refreshToken: tokenMock,
      });

      await expect(
        controller.redeemOAuthHandoff(
          { handoffCode: 'one-time-code', codeVerifier: 'code-verifier' },
          mockRequest({ headers: { origin: 'https://redir.altairgraphql.dev' } })
        )
      ).resolves.toEqual({
        tokens: { accessToken: tokenMock, refreshToken: tokenMock },
      });
      expect(oauthLoginTransactionService.redeem).toHaveBeenCalledWith(
        'one-time-code',
        'code-verifier',
        'https://redir.altairgraphql.dev'
      );
    });
  });

  describe('githubSigninCallback', () => {
    it('should redirect with a one-time handoff code', async () => {
      const user = mockUser();
      const requestMock = mockRequest({
        user,
        query: { state: 'opaque-state' },
        headers: { cookie: 'altair_oauth_transaction=browser-binding' },
      });
      const responseMock = mockResponse({
        redirect: vi.fn(),
        clearCookie: vi.fn(),
      });
      vi.spyOn(authService, 'githubLogin').mockReturnValueOnce(user);
      oauthLoginTransactionService.complete.mockResolvedValueOnce({
        handoffCode: 'one-time-code',
        redirectUrl: 'https://redir.altairgraphql.dev/?nonce=nonce',
      });

      await controller.githubSigninCallback(requestMock, responseMock);

      expect(oauthLoginTransactionService.complete).toHaveBeenCalledWith(
        'GITHUB',
        'opaque-state',
        'browser-binding',
        user.id
      );
      expect(responseMock.redirect).toHaveBeenCalledWith(
        'https://redir.altairgraphql.dev/?nonce=nonce&handoff_code=one-time-code'
      );
    });
  });

  describe('getUserProfile', () => {
    it('should return the user object from the service', () => {
      const requestMock = mockRequest({ user: mockUser() });

      expect(controller.getUserProfile(requestMock)).toBeUser();
    });
  });

  describe('getShortlivedEventsToken', () => {
    it('should return a short lived token for the current user', () => {
      const requestMock = mockRequest({ user: mockUser() });
      vi.spyOn(authService, 'getShortLivedEventsToken').mockReturnValueOnce(
        tokenMock
      );

      expect(controller.getShortlivedEventsToken(requestMock).slt).toEqual(
        tokenMock
      );
    });

    it('should throw an error if the user ID is missing from the request', () => {
      expect(() => controller.getShortlivedEventsToken(mockRequest())).toThrow(
        UnauthorizedException
      );
    });
  });
});
