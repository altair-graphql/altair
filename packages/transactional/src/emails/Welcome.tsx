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

export interface WelcomeEmailProps {
  username: string;
}

const PropDefaults: WelcomeEmailProps = {
  username: 'User',
};

export const WelcomeEmail = ({
  username = PropDefaults.username,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Altair GraphQL Cloud</Preview>
      <Tailwind
        config={{
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
        }}
      >
        <Body className="bg-offwhite text-base font-sans">
          <Img
            src={`https://altairgraphql.dev/assets/img/altair_logo_128.png`}
            width="100"
            height="100"
            alt="Altair GraphQL Cloud"
            className="mx-auto my-20"
          />
          <Container className="bg-white p-45">
            <Heading className="text-center my-0 leading-8">
              Welcome to Altair GraphQL Cloud
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">Hey {username}! 👋🏾</Text>

                <Text className="text-base">
                  I'm Samuel, the creator of Altair GraphQL Client. Thanks so much
                  for subscribing to Altair GraphQL Cloud!
                </Text>

                <Text className="text-base">
                  I'd love to hear what made you choose Altair Premium and what
                  features you're most excited about. Just hit reply and let me know
                  your thoughts!
                </Text>

                <Text className="text-base">
                  In the meantime, you can get started by checking out the docs
                </Text>
              </Row>
            </Section>

            {/* <ul>{steps?.map(({ Description }) => Description)}</ul> */}

            <Section className="text-center">
              <Button
                className="bg-brand text-white rounded-md py-3 px-[18px] block"
                href="https://altairgraphql.dev/docs/cloud/"
              >
                Get Started
              </Button>
            </Section>

            {/* <Section className="mt-45">
              <Row>
                {links?.map((link) => (
                  <Column key={link}>
                    <Link className="text-black underline font-bold">{link}</Link>{' '}
                    <span className="text-green-500">→</span>
                  </Column>
                ))}
              </Row>
            </Section> */}
          </Container>

          {/* <Container className="mt-20">
            <Section>
              <Row>
                <Column className="text-right px-20">
                  <Link>Unsubscribe</Link>
                </Column>
                <Column className="text-left">
                  <Link>Manage Preferences</Link>
                </Column>
              </Row>
            </Section>
            <Text className="text-center text-gray-400 mb-45">
              Netlify, 44 Montgomery Street, Suite 300 San Francisco, CA
            </Text>
          </Container> */}
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
