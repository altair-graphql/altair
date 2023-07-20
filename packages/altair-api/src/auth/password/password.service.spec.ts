import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

describe('PasswordService', () => {
  let service: PasswordService;
  let configService: ConfigService;

  const passwordMock = '123456';
  const hashMock =
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService, ConfigService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bcryptSaltRounds', () => {
    it(`should return the salt rounds`, () => {
      // GIVEN
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce({ bcryptSaltOrRound: 16 });

      // WHEN
      const rounds = service.bcryptSaltRounds;

      // THEN
      expect(rounds).toEqual(16);
    });
  });

  describe('validatePassword', () => {
    it(`should return true if the password matches the provided hash`, async () => {
      // GIVEN
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(true));

      // WHEN
      const validationResult = await service.validatePassword(
        passwordMock,
        hashMock
      );

      // THEN
      expect(validationResult).toBe(true);
    });

    it(`should return false if the password doesn't match the provided hash`, async () => {
      // GIVEN
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(false));

      // WHEN
      const validationResult = await service.validatePassword(
        passwordMock,
        `${hashMock}-test`
      );

      // THEN
      expect(validationResult).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it(`should returned the hash of the password`, async () => {
      // GIVEN
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => hashMock);

      // WHEN
      const hash = await service.hashPassword(passwordMock);

      // THEN
      expect(hash).toEqual(hashMock);
    });
  });
});
