import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';
import {
  otherPasswordMock,
  passwordHashMapping,
  passwordMock,
} from '../mocks/password.mock';

describe('PasswordService', () => {
  let service: PasswordService;
  let configService: ConfigService;

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
      // WHEN
      const validationResult = await service.validatePassword(
        passwordMock,
        passwordHashMapping[passwordMock]
      );

      // THEN
      expect(validationResult).toBe(true);
    });

    it(`should return false if the password doesn't match the provided hash`, async () => {
      // WHEN
      const validationResult = await service.validatePassword(
        passwordMock,
        passwordHashMapping[otherPasswordMock]
      );

      // THEN
      expect(validationResult).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it(`should returned the hash of the password`, async () => {
      // WHEN
      const hash = await service.hashPassword(otherPasswordMock);

      // THEN
      expect(hash).toBeBcryptHash();
    });
  });
});
