import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@altairgraphql/emails';
import { UserService } from 'src/auth/user/user.service';
import { Config } from 'src/common/config';
import { User } from '@altairgraphql/db';

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
      firstName: this.getFirstName(user),
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
      html: await renderWelcomeEmail({ username: this.getFirstName(user) }),
    });
    if (error) {
      console.error('Error sending welcome email', error);
    }

    return { data, error };
  }

  async sendGoodbyeEmail(userId: string) {
    const user = await this.userService.mustGetUser(userId);
    const { data, error } = await this.resend.emails.send({
      from:
        this.configService.get('email.defaultFrom', { infer: true }) ??
        'info@mail.altairgraphql.dev',
      to: user.email,
      replyTo: this.configService.get('email.replyTo', { infer: true }),
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
      console.error('Error sending goodbye email', error);
    }

    return { data, error };
  }

  private getFirstName(user: User) {
    return user.firstName ?? user.email;
  }
}
