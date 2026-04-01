import { Options, render } from '@react-email/components';
import { WelcomeEmail, WelcomeEmailProps } from './emails/Welcome';
import {
  TeamInvitationEmail,
  TeamInvitationEmailProps,
} from './emails/TeamInvitation';
import {
  EmailVerificationEmail,
  EmailVerificationEmailProps,
} from './emails/EmailVerification';
import { GoodbyeEmail, GoodbyeEmailProps } from './emails/Goodbye';

export const renderWelcomeEmail = (props: WelcomeEmailProps, options?: Options) => {
  return render(<WelcomeEmail {...props} />, options);
};

export const renderTeamInvitationEmail = (
  props: TeamInvitationEmailProps,
  options?: Options
) => {
  return render(<TeamInvitationEmail {...props} />, options);
};

export const renderEmailVerificationEmail = (
  props: EmailVerificationEmailProps,
  options?: Options
) => {
  return render(<EmailVerificationEmail {...props} />, options);
};

export const renderGoodbyeEmail = (props: GoodbyeEmailProps, options?: Options) => {
  return render(<GoodbyeEmail {...props} />, options);
};
