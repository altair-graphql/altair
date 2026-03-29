import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

export interface EmailVerificationEmailProps {
  firstName: string;
  verificationUrl: string;
}

export const EmailVerificationEmail = ({
  firstName = 'User',
  verificationUrl = 'https://altairgraphql.dev',
}: EmailVerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email — Altair GraphQL Cloud</Preview>
      <Tailwind
        config={
          {
            theme: {
              extend: {
                colors: {
                  brand: '#64CB29',
                  offwhite: '#fafbfb',
                },
                spacing: {
                  0: '0px',
                  20: '20px',
                  45: '45px',
                },
              },
            },
          } as any
        }
      >
        <Body className="bg-offwhite text-base font-sans">
          <Img
            src="https://altairgraphql.dev/assets/img/altair_logo_128.png"
            width="100"
            height="100"
            alt="Altair GraphQL Cloud"
            className="mx-auto my-20"
          />
          <Container className="bg-white p-45">
            <Heading className="text-center my-0 leading-8">
              Verify Your Email
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">Hi {firstName},</Text>

                <Text className="text-base">
                  Thanks for signing up for Altair GraphQL Cloud! Please verify
                  your email address by clicking the button below:
                </Text>
              </Row>
            </Section>

            <Section className="text-center">
              <Button
                className="bg-brand text-white rounded-md py-3 px-[18px] block"
                href={verificationUrl}
              >
                Verify Email
              </Button>
            </Section>

            <Section>
              <Row>
                <Text className="text-base">
                  Or copy this link:{' '}
                  <Link href={verificationUrl}>{verificationUrl}</Link>
                </Text>

                <Text className="text-base">
                  This link expires in 24 hours.
                </Text>

                <Text className="text-base text-gray-500">
                  If you didn't create an account, you can safely ignore this
                  email.
                </Text>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailVerificationEmail;
