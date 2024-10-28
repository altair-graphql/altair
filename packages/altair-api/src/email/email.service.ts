import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@altairgraphql/emails';

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('email.resendApiKey'));
  }

  async sendWelcomeEmail(email: string, username: string) {
    const { data, error } = await this.resend.emails.send({
      from:
        this.configService.get('email.defaultFrom') ?? 'info@mail.altairgraphql.dev',
      to: email,
      replyTo: this.configService.get('email.replyTo'),
      subject: 'Welcome to Altair GraphQL Cloud',
      html: await renderWelcomeEmail({ username }),
    });
    if (error) {
      console.error('Error sending welcome email', error);
    }

    return { data, error };
  }
}
