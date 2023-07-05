import { BASIC_PLAN_ID, PRO_PLAN_ID, User } from '@altairgraphql/db';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { StripeService } from 'src/stripe/stripe.service';
import { ProviderInfo } from '../models/provider-info.dto';
import { SignupInput } from '../models/signup.input';
import { UpdateUserInput } from '../models/update-user.input';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService
  ) {}

  async createUser(
    payload: SignupInput,
    providerInfo?: ProviderInfo
  ): Promise<User> {
    // const hashedPassword = await this.passwordService.hashPassword(
    //   payload.password
    // );

    try {
      // Create stripe customer
      const stripeCustomer = await this.stripeService.connectOrCreateCustomer(
        payload.email
      );
      const user = await this.prisma.user.create({
        data: {
          ...payload,
          stripeCustomerId: stripeCustomer.id,
          // password: hashedPassword,
          Workspace: {
            create: {
              name: 'My workspace',
            },
          },
          ...(providerInfo
            ? {
                UserCredential: {
                  create: {
                    provider: providerInfo.provider,
                    providerUserId: providerInfo.providerUserId,
                  },
                },
              }
            : {}),
        },
      });

      return user;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e as any);
    }
  }

  getUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async mustGetUser(userId: string) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User not found for id: ${userId}`);
    }
    return user;
  }

  getUserByStripeCustomerId(stripeCustomerId: string) {
    return this.prisma.user.findFirst({
      where: {
        stripeCustomerId,
      },
    });
  }

  updateUser(userId: string, newUserData: UpdateUserInput) {
    return this.prisma.user.update({
      data: newUserData,
      where: {
        id: userId,
      },
    });
  }

  async getPlanConfig(userId: string) {
    const res = await this.prisma.userPlan.findUnique({
      where: {
        userId,
      },
      include: {
        planConfig: true,
      },
    });

    if (!res) {
      this.logger.warn(
        `No plan config found for user (${userId}). Falling back to basic.`
      );

      return this.prisma.planConfig.findUnique({
        where: {
          id: BASIC_PLAN_ID,
        },
      });
    }

    return {
      ...res.planConfig,
      maxTeamMemberCount: res.planConfig.allowMoreTeamMembers
        ? Infinity
        : res.planConfig.maxTeamMemberCount,
    };
  }

  async updateSubscriptionQuantity(userId: string, quantity: number) {
    const user = await this.mustGetUser(userId);

    // update stripe subscription quantity
    if (!user.stripeCustomerId) {
      throw new Error(
        `Cannot update subscription quantity since user (${userId}) does not have a stripe customer ID`
      );
    }

    return this.stripeService.updateSubscriptionQuantity(
      user.stripeCustomerId,
      quantity
    );
  }

  async getStripeCustomerId(userId: string) {
    const user = await this.mustGetUser(userId);

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // retrieve customer ID from Stripe
    const res = await this.stripeService.connectOrCreateCustomer(user.email);
    const customerId = res.id;

    // update user with customer ID
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeCustomerId: customerId,
      },
    });

    return customerId;
  }

  async getBillingUrl(userId: string, returnUrl?: string) {
    const customerId = await this.getStripeCustomerId(userId);

    const session = await this.stripeService.createBillingSession(
      customerId,
      returnUrl
    );

    return session.url;
  }

  async getProPlanUrl(userId: string) {
    const planConfig = await this.getPlanConfig(userId);
    if (planConfig.id === PRO_PLAN_ID) {
      console.warn(
        'User is already on pro plan. Going to return billing url instead.'
      );
      return this.getBillingUrl(userId);
    }

    const customerId = await this.getStripeCustomerId(userId);
    const proPlanInfo = await this.stripeService.getPlanInfoByRole(PRO_PLAN_ID);

    if (!proPlanInfo) {
      throw new Error(`No plan info found for id: ${PRO_PLAN_ID}`);
    }
    const session = await this.stripeService.createCheckoutSession(
      customerId,
      proPlanInfo.price_id
    );

    return session.url;
  }
}
