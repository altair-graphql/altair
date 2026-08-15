import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from 'nestjs-prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OAuthLoginTransactionService } from './oauth-login-transaction.service';

describe('OAuthLoginTransactionService', () => {
  let service: OAuthLoginTransactionService;
  let findUnique: ReturnType<typeof vi.fn>;
  let updateMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findUnique = vi.fn();
    updateMany = vi.fn();
    service = new OAuthLoginTransactionService(
      {
        oAuthLoginTransaction: {
          findUnique,
          updateMany,
        },
      } as unknown as PrismaService,
      {
        get: vi.fn(),
      } as unknown as ConfigService
    );
  });

  it('should reject a code redemption from an origin other than its redirect origin', async () => {
    const codeVerifier = 'a'.repeat(43);
    findUnique.mockResolvedValue({
      id: 'transaction-id',
      userId: 'user-id',
      redirectUrl: 'https://redir-one.example/login',
      redemptionVerifierHash: createHash('sha256')
        .update(codeVerifier)
        .digest('base64url'),
      expiresAt: new Date(Date.now() + 60_000),
      redeemedAt: null,
    });

    await expect(
      service.redeem('handoff-code', codeVerifier, 'https://redir-two.example')
    ).rejects.toThrow(BadRequestException);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('should reject a code redemption without the transaction verifier', async () => {
    findUnique.mockResolvedValue({
      id: 'transaction-id',
      userId: 'user-id',
      redirectUrl: 'https://redir-one.example/login',
      redemptionVerifierHash: createHash('sha256')
        .update('a'.repeat(43))
        .digest('base64url'),
      expiresAt: new Date(Date.now() + 60_000),
      redeemedAt: null,
    });

    await expect(
      service.redeem('handoff-code', 'b'.repeat(43), 'https://redir-one.example')
    ).rejects.toThrow(BadRequestException);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('should give a completed handoff code a fresh short expiry', async () => {
    const state = 'state';
    const browserBinding = 'browser-binding';
    const hash = (value: string) => createHash('sha256').update(value).digest('hex');
    findUnique.mockResolvedValue({
      id: 'transaction-id',
      provider: 'GOOGLE',
      userId: null,
      stateHash: hash(state),
      browserBindingHash: hash(browserBinding),
      expiresAt: new Date(Date.now() + 1_000),
    });
    updateMany.mockResolvedValue({ count: 1 });
    const beforeCompletion = Date.now();

    await service.complete('GOOGLE', state, browserBinding, 'user-id');

    const completionData = updateMany.mock.calls[0][0].data;
    expect(completionData.expiresAt.getTime()).toBeGreaterThanOrEqual(
      beforeCompletion + 59_000
    );
    expect(completionData.expiresAt.getTime()).toBeLessThanOrEqual(
      beforeCompletion + 61_000
    );
  });
});
