import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@altairgraphql/emails';
import { UserService } from 'src/auth/user/user.service';
import { Config } from 'src/common/config';

@Injectable()
export class EmailService {
  private resend: Resend;
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
      console.error('No audience ID found');
      return;
    }

    const { data, error } = await this.resend.contacts.create({
      email: user.email,
      audienceId,
      firstName: user.firstName ?? user.email,
      lastName: user.lastName ?? '',
    });

    if (error) {
      console.error('Error subscribing user', error);
      return;
    }

    if (!data?.id) {
      console.error('No contact ID found');
      return;
    }

    await this.userService.updateUserResendContactId(userId, data.id);
  }

  async sendWelcomeEmail(userId: string) {
    const user = await this.userService.mustGetUser(userId);
    const { data, error } = await this.resend.emails.send({
      from:
        this.configService.get('email.defaultFrom', { infer: true }) ??
        'info@mail.altairgraphql.dev',
      to: user.email,
      replyTo: this.configService.get('email.replyTo', { infer: true }),
      subject: 'Welcome to Altair GraphQL Cloud',
      html: await renderWelcomeEmail({ username: user.firstName ?? user.email }),
    });
    if (error) {
      console.error('Error sending welcome email', error);
    }

    return { data, error };
  }
}
