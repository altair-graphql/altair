import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IdentityProvider } from '@altairgraphql/db';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from 'nestjs-prisma';
import { Config } from 'src/common/config';

const TRANSACTION_TTL_MS = 5 * 60 * 1000;
const HANDOFF_TTL_MS = 60 * 1000;
const SECRET_BYTES = 32;

interface OAuthLoginTransactionSecrets {
  browserBinding: string;
  state: string;
}

@Injectable()
export class OAuthLoginTransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Config>
  ) {}

  async create(
    provider: IdentityProvider,
    redirectUrl: string,
    redemptionVerifierHash: string
  ): Promise<OAuthLoginTransactionSecrets> {
    const url = this.parseAndValidateRedirectUrl(redirectUrl);
    if (!this.isCodeChallenge(redemptionVerifierHash)) {
      throw new BadRequestException('Invalid OAuth code challenge');
    }
    const state = this.generateSecret();
    const browserBinding = this.generateSecret();

    await this.prisma.oAuthLoginTransaction.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    await this.prisma.oAuthLoginTransaction.create({
      data: {
        provider,
        redirectUrl: url.href,
        stateHash: this.hash(state),
        browserBindingHash: this.hash(browserBinding),
        redemptionVerifierHash,
        expiresAt: new Date(Date.now() + TRANSACTION_TTL_MS),
      },
    });

    return { state, browserBinding };
  }

  async complete(
    provider: IdentityProvider,
    state: string,
    browserBinding: string,
    userId: string
  ): Promise<{ handoffCode: string; redirectUrl: string }> {
    const transaction = await this.prisma.oAuthLoginTransaction.findUnique({
      where: { stateHash: this.hash(state) },
    });

    if (
      !transaction ||
      transaction.provider !== provider ||
      transaction.expiresAt <= new Date() ||
      transaction.userId ||
      !this.secretsMatch(transaction.browserBindingHash, this.hash(browserBinding))
    ) {
      throw new BadRequestException('Invalid or expired OAuth transaction');
    }

    const handoffCode = this.generateSecret();
    const updated = await this.prisma.oAuthLoginTransaction.updateMany({
      where: {
        id: transaction.id,
        userId: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        userId,
        handoffCodeHash: this.hash(handoffCode),
        expiresAt: new Date(Date.now() + HANDOFF_TTL_MS),
      },
    });

    if (updated.count !== 1) {
      throw new BadRequestException('Invalid or expired OAuth transaction');
    }

    return { handoffCode, redirectUrl: transaction.redirectUrl };
  }

  async redeem(
    handoffCode: string,
    codeVerifier: string,
    origin: string
  ): Promise<string> {
    const transaction = await this.prisma.oAuthLoginTransaction.findUnique({
      where: { handoffCodeHash: this.hash(handoffCode) },
    });

    if (
      !transaction ||
      !transaction.userId ||
      transaction.expiresAt <= new Date() ||
      transaction.redeemedAt ||
      !this.redirectOriginMatches(transaction.redirectUrl, origin) ||
      !this.secretsMatch(
        transaction.redemptionVerifierHash,
        this.codeChallenge(codeVerifier)
      )
    ) {
      throw new BadRequestException('Invalid or expired OAuth handoff code');
    }

    const updated = await this.prisma.oAuthLoginTransaction.updateMany({
      where: {
        id: transaction.id,
        redeemedAt: null,
        expiresAt: { gt: new Date() },
        redemptionVerifierHash: this.codeChallenge(codeVerifier),
      },
      data: { redeemedAt: new Date() },
    });

    if (updated.count !== 1) {
      throw new BadRequestException('Invalid or expired OAuth handoff code');
    }

    return transaction.userId;
  }

  private parseAndValidateRedirectUrl(value: string): URL {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new BadRequestException('Invalid redirect URL');
    }

    if (!this.isAllowedRedirectUrl(url)) {
      throw new BadRequestException('Redirect origin not allowed');
    }

    return url;
  }

  isAllowedRedirectOrigin(value: string): boolean {
    try {
      return this.isAllowedRedirectUrl(new URL(value));
    } catch {
      return false;
    }
  }

  private isAllowedRedirectUrl(url: URL): boolean {
    const allowedOrigins =
      this.configService.get<string[]>('allowedRedirectOrigins') ?? [];
    const isConfiguredOrigin = allowedOrigins.some((allowed) => {
      try {
        return new URL(allowed).origin === url.origin;
      } catch {
        return false;
      }
    });

    if (isConfiguredOrigin) {
      return true;
    }

    return (
      url.protocol === 'http:' &&
      url.port !== '' &&
      (url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '[::1]')
    );
  }

  private generateSecret(): string {
    return randomBytes(SECRET_BYTES).toString('base64url');
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private secretsMatch(left: string, right: string): boolean {
    return timingSafeEqual(Buffer.from(left), Buffer.from(right));
  }

  private codeChallenge(codeVerifier: string): string {
    return createHash('sha256').update(codeVerifier).digest('base64url');
  }

  private isCodeChallenge(value: string): boolean {
    return /^[A-Za-z0-9_-]{43}$/.test(value);
  }

  private redirectOriginMatches(redirectUrl: string, origin: string): boolean {
    try {
      return new URL(redirectUrl).origin === new URL(origin).origin;
    } catch {
      return false;
    }
  }
}
