import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password/password.service';
import { mockRequest, mockResponse } from './mocks/express.mock';
import { mockUser } from './mocks/prisma-service.mock';
import { User } from '@altairgraphql/db';
import { IToken } from '@altairgraphql/api-utils';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const tokenMock =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  let authServiceReturnMock: User & { tokens: IToken };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        PrismaService,
        PasswordService,
        ConfigService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    authServiceReturnMock = {
      ...mockUser(),
      tokens: {
        accessToken: tokenMock,
        refreshToken: tokenMock,
      },
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleSigninCallback', () => {
    it(`should redirect to the URL encoded in the state`, () => {
      // GIVEN
      const requestMock = mockRequest({
        user: mockUser(),
        query: {
          state: 'https://google.com',
        },
      });
      const responseMock = mockResponse({
        redirect: jest.fn(),
      });
      jest
        .spyOn(authService, 'googleLogin')
        .mockReturnValueOnce(authServiceReturnMock);

      // WHEN
      controller.googleSigninCallback(requestMock, responseMock);

      // THEN
      expect(responseMock.redirect).toBeCalledWith(
        'https://google.com/?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      );
    });

    it(`should throw if the state can't be parsed to URL`, () => {
      // GIVEN
      const requestMock = mockRequest({
        user: mockUser(),
        query: {
          state: 'hi',
        },
      });
      const responseMock = mockResponse({
        redirect: jest.fn(),
      });
      jest
        .spyOn(authService, 'googleLogin')
        .mockReturnValueOnce(authServiceReturnMock);

      // THEN
      expect(() =>
        controller.googleSigninCallback(requestMock, responseMock)
      ).toThrow(BadRequestException);
    });

    it(`should redirect to the product website if the state query param is not provided`, () => {
      // GIVEN
      const requestMock = mockRequest({
        user: mockUser(),
        query: {},
      });
      const responseMock = mockResponse({
        redirect: jest.fn(),
      });
      jest
        .spyOn(authService, 'googleLogin')
        .mockReturnValueOnce(authServiceReturnMock);

      // WHEN
      controller.googleSigninCallback(requestMock, responseMock);

      // THEN
      expect(responseMock.redirect).toBeCalledWith('https://altairgraphql.dev');
    });
  });

  describe('getUserProfile', () => {
    it(`should return the user object from the service`, () => {
      // GIVEN
      const requestMock = mockRequest({ user: mockUser() });
      jest
        .spyOn(authService, 'googleLogin')
        .mockReturnValueOnce(authServiceReturnMock);

      // WHEN
      const user = controller.getUserProfile(requestMock);

      // THEN
      expect(user).toBeUser();
    });
  });

  describe('getShortlivedEventsToken', () => {
    it(`should return a short lived token for the current user`, () => {
      // GIVEN
      const requestMock = mockRequest({ user: mockUser() });
      jest
        .spyOn(authService, 'getShortLivedEventsToken')
        .mockReturnValueOnce(tokenMock);

      // WHEN
      const token = controller.getShortlivedEventsToken(requestMock);

      // THEN
      expect(token.slt).toEqual(tokenMock);
    });

    it(`should throw an error if the user ID is missing from the request`, () => {
      // GIVEN
      const requestMock = mockRequest();

      // THEN
      expect(() => controller.getShortlivedEventsToken(requestMock)).toThrow(
        BadRequestException
      );
    });
  });
});
