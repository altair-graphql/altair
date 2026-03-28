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

export interface TeamInvitationEmailProps {
  teamName: string;
  inviterName: string;
  acceptUrl: string;
}

export const TeamInvitationEmail = ({
  teamName = 'My Team',
  inviterName = 'Someone',
  acceptUrl = 'https://altairgraphql.dev',
}: TeamInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        You've been invited to join "{teamName}" on Altair GraphQL
      </Preview>
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
              Team Invitation
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">Hi,</Text>

                <Text className="text-base">
                  {inviterName} has invited you to join the team{' '}
                  <strong>{teamName}</strong> on Altair GraphQL Cloud.
                </Text>
              </Row>
            </Section>

            <Section className="text-center">
              <Button
                className="bg-brand text-white rounded-md py-3 px-[18px] block"
                href={acceptUrl}
              >
                Accept Invitation
              </Button>
            </Section>

            <Section>
              <Row>
                <Text className="text-base">
                  Or copy this link:{' '}
                  <Link href={acceptUrl}>{acceptUrl}</Link>
                </Text>

                <Text className="text-base">
                  This invitation expires in 7 days.
                </Text>

                <Text className="text-base text-gray-500">
                  If you didn't expect this email, you can safely ignore it.
                </Text>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TeamInvitationEmail;
