import { Options, render } from '@react-email/components';
import { WelcomeEmail, WelcomeEmailProps } from './emails/Welcome';

export const renderWelcomeEmail = (props: WelcomeEmailProps, options?: Options) => {
  return render(<WelcomeEmail {...props} />, options);
};
