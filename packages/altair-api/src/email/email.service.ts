import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@altairgraphql/emails';
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
      html: `Hi,
      <br><br>
      ${inviterName} has invited you to join the team <strong>${teamName}</strong> on Altair GraphQL Cloud.
      <br><br>
      <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#6b4fbb;color:#fff;text-decoration:none;border-radius:6px;">Accept Invitation</a>
      <br><br>
      Or copy this link: ${acceptUrl}
      <br><br>
      This invitation expires in 7 days.
      <br><br>
      If you didn't expect this email, you can safely ignore it.
      <br><br>
      — The Altair GraphQL Team`,
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
      html: `Hi ${firstName},
      <br><br>
      Thanks for signing up for Altair GraphQL Cloud! Please verify your email address by clicking the button below:
      <br><br>
      <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#6b4fbb;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
      <br><br>
      Or copy this link: ${verificationUrl}
      <br><br>
      This link expires in 24 hours.
      <br><br>
      If you didn't create an account, you can safely ignore this email.
      <br><br>
      — The Altair GraphQL Team`,
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
      subject: 'Sorry to see you go 👋🏾',
      html: `Hey ${this.getFirstName(user)},
      <br><br>
      Samuel here. I noticed you've cancelled your Altair GraphQL pro subscription and wanted to check in.
      <br><br>
      Would you mind sharing what led to your decision? Your feedback helps us make Altair better for everyone. Just hit reply to let me know.
      <br><br>
      If you ever want to come back, we'll be here! And of course, you can keep using Altair's free version as long as you like.
      <br><br>
      Thanks for giving the pro version a try!
      <br><br>
      Best wishes,
      <br>
      Samuel
      <br><br>
      P.S. If you cancelled because of a technical issue or need help with something, just let me know -- I'm happy to help!`,
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
