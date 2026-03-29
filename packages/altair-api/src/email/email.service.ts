import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  renderWelcomeEmail,
  renderTeamInvitationEmail,
  renderEmailVerificationEmail,
  renderGoodbyeEmail,
} from '@altairgraphql/emails';
import { UserService } from 'src/auth/user/user.service';
import { Config } from 'src/common/config';
import { User } from '@altairgraphql/db';
import { Agent, getAgent } from 'src/newrelic/newrelic';

@Injectable()
export class EmailService {
  private resend: Resend;
  private agent = getAgent();
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService<Config>,
    private readonly userService: UserService
  ) {
    this.resend = new Resend(
      this.configService.get('email.resendApiKey', { infer: true })
    );
  }

  async subscribeUser(userId: string) {
    const user = await this.userService.mustGetUser(userId);
    if (user.resendContactId) {
      return;
    }
    const audienceId = this.configService.get('email.audienceId', { infer: true });

    if (!audienceId) {
      this.logger.error('No audience ID found');
      return;
    }

    const { data, error } = await this.resend.contacts.create({
      email: user.email,
      audienceId,
      firstName: this.getFirstName(user),
      lastName: user.lastName ?? '',
    });

    if (error) {
      this.logger.error('Error subscribing user', error);
      return;
    }

    if (!data?.id) {
      this.logger.error('No contact ID found');
      return;
    }

    await this.userService.updateUserResendContactId(userId, data.id);
  }

  async sendWelcomeEmail(userId: string) {
    const user = await this.userService.mustGetUser(userId);
    const { data, error } = await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Altair GraphQL Cloud',
      html: await renderWelcomeEmail({ username: this.getFirstName(user) }),
    });
    if (error) {
      this.logger.error('Error sending welcome email', error);
    }

    return { data, error };
  }

  async sendTeamInvitationEmail({
    email,
    teamName,
    inviterName,
    acceptUrl,
  }: {
    email: string;
    teamName: string;
    inviterName: string;
    acceptUrl: string;
  }) {
    const { data, error } = await this.sendEmail({
      to: email,
      subject: `You've been invited to join "${teamName}" on Altair GraphQL`,
      html: await renderTeamInvitationEmail({ teamName, inviterName, acceptUrl }),
    });
    if (error) {
      this.logger.error('Error sending invitation email', error);
    }
    return { data, error };
  }

  async sendVerificationEmail(userId: string, verificationUrl: string) {
    const user = await this.userService.mustGetUser(userId);
    const firstName = this.getFirstName(user);

    const { data, error } = await this.sendEmail({
      to: user.email,
      subject: 'Verify your email — Altair GraphQL Cloud',
      html: await renderEmailVerificationEmail({ firstName, verificationUrl }),
    });
    if (error) {
      this.logger.error('Error sending verification email', error);
    }
    return { data, error };
  }

  async sendGoodbyeEmail(userId: string) {
    const user = await this.userService.mustGetUser(userId);

    const { data, error } = await this.sendEmail({
      to: user.email,
      subject: 'Sorry to see you go',
      html: await renderGoodbyeEmail({ firstName: this.getFirstName(user) }),
    });
    if (error) {
      this.logger.error('Error sending goodbye email', error);
    }

    return { data, error };
  }

  private async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const { data, error } = await this.resend.emails.send({
      from:
        this.configService.get('email.defaultFrom', { infer: true }) ??
        'info@mail.altairgraphql.dev',
      to,
      replyTo: this.configService.get('email.replyTo', { infer: true }),
      subject,
      html,
    });
    if (error) {
      this.agent?.incrementMetric('email.send.error');
    } else {
      this.agent?.incrementMetric('email.send.success');
    }
    return { data, error };
  }

  private getFirstName(user: User) {
    return user.firstName ?? user.email;
  }
}
