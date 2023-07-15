import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from './auth.service';
import { PasswordService } from './password/password.service';
import { mockUser } from './mocks/prisma-service.mock';
import { ChangePasswordInput } from './models/change-password.input';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let passwordService: PasswordService;
  let jwtService: JwtService;

  const passwordMock = '123456';
  const tokenMock =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        PrismaService,
        PasswordService,
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('passwordLogin', () => {
    it(`should return a user object on successful login`, async () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);
      jest
        .spyOn(passwordService, 'validatePassword')
        .mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokenMock);

      // WHEN
      const user = await service.passwordLogin(userMock.email, passwordMock);

      // THEN
      expect(user).toBeUser();
      expect(user.email).toBe(userMock.email);
    });

    it(`should throw an error if the user doesn't exist`, () => {
      // GIVEN
      const emailMock = mockUser().email;
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      // THEN
      expect(service.passwordLogin(emailMock, passwordMock)).rejects.toThrow(
        `No user found for email: ${emailMock}`
      );
    });

    it(`should throw an error if the provided password is invalid`, () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);
      jest
        .spyOn(passwordService, 'validatePassword')
        .mockResolvedValueOnce(false);

      // THEN
      expect(
        service.passwordLogin(userMock.email, passwordMock)
      ).rejects.toThrow(`Invalid password`);
    });
  });

  describe('googleLogin', () => {
    it(`should return a user object on successful login`, async () => {
      // GIVEN
      const userMock = mockUser();
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokenMock);

      // WHEN
      const user = await service.googleLogin(userMock);

      // THEN
      expect(user).toBeUser();
      expect(user.email).toBe(userMock.email);
    });

    it(`should throw an error if the user object is missing from the request`, () => {
      // THEN
      expect(() => service.googleLogin(undefined)).toThrow(
        'No user from google'
      );
    });
  });

  describe('getUserFromToken', () => {
    it(`should return a user object`, async () => {
      // GIVEN
      const userMock = mockUser();
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({
        userId: 'e23b7b34-8996-45d3-9097-b14b8f451dbd',
      });
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(userMock);

      // WHEN
      const user = await service.getUserFromToken(tokenMock);

      // THEN
      expect(user).toBeUser();
    });

    it(`should throw an error if the token is invalid`, () => {
      // GIVEN
      jest
        .spyOn(jwtService, 'decode')
        .mockReturnValueOnce(`Couldn't decode token.`);

      // THEN
      expect(() => service.getUserFromToken(tokenMock)).toThrow(
        'Invalid JWT token'
      );
    });
  });

  describe('changePassword', () => {
    let changePasswordInputMock: ChangePasswordInput;

    beforeAll(() => {
      changePasswordInputMock = {
        oldPassword: passwordMock,
        newPassword: passwordMock,
      } as ChangePasswordInput;
    });

    it(`should return a user object on successful password change`, async () => {
      // GIVEN
      const userMock = mockUser();
      jest
        .spyOn(passwordService, 'validatePassword')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(passwordService, 'hashPassword')
        .mockResolvedValue(
          '6bfbaac71e1cb8876538505e5c8d9a6653eef56c592cc9691e9a70a427680136'
        );
      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce(userMock);

      // WHEN
      const user = await service.changePassword(
        userMock.id,
        passwordMock,
        changePasswordInputMock
      );

      // THEN
      expect(user).toBeUser();
    });

    it(`should throw an error if the user password is invalid`, () => {
      // GIVEN
      jest
        .spyOn(passwordService, 'validatePassword')
        .mockResolvedValueOnce(false);

      // THEN
      expect(
        service.changePassword(
          mockUser().id,
          passwordMock,
          changePasswordInputMock
        )
      ).rejects.toThrow('Invalid password');
    });
  });

  describe('getLoginResponse', () => {
    it(`should return a user object with tokens`, async () => {
      // GIVEN
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokenMock);

      // WHEN
      const response = await service.getLoginResponse(mockUser());

      // THEN
      expect(response).toBeUser();
      expect(response.tokens.accessToken).toEqual(expect.any(String));
      expect(response.tokens.refreshToken).toEqual(expect.any(String));
    });
  });

  describe('generateTokens', () => {
    it(`should return authentication tokens`, async () => {
      // GIVEN
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokenMock);

      // WHEN
      const tokens = await service.generateTokens({ userId: mockUser().id });

      // THEN
      expect(tokens.accessToken).toEqual(expect.any(String));
      expect(tokens.refreshToken).toEqual(expect.any(String));
    });
  });

  describe('refreshToken', () => {
    it(`should return authentication tokens on successful refresh`, () => {
      // GIVEN
      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValueOnce({ userId: mockUser().id });
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokenMock);

      // WHEN
      const tokens = service.refreshToken(tokenMock);

      // THEN
      expect(tokens.accessToken).toEqual(expect.any(String));
      expect(tokens.refreshToken).toEqual(expect.any(String));
    });

    it(`should throw an error if the token input token is invalid`, () => {
      // GIVEN
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      // THEN
      expect(() => service.refreshToken(tokenMock)).toThrow(
        UnauthorizedException
      );
    });
  });
});
