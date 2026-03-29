import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

export interface GoodbyeEmailProps {
  firstName: string;
}

export const GoodbyeEmail = ({
  firstName = 'User',
}: GoodbyeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sorry to see you go</Preview>
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
              Sorry to see you go
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">Hey {firstName},</Text>

                <Text className="text-base">
                  Samuel here. I noticed you've cancelled your Altair GraphQL pro
                  subscription and wanted to check in.
                </Text>

                <Text className="text-base">
                  Would you mind sharing what led to your decision? Your feedback
                  helps us make Altair better for everyone. Just hit reply to let
                  me know.
                </Text>

                <Text className="text-base">
                  If you ever want to come back, we'll be here! And of course,
                  you can keep using Altair's free version as long as you like.
                </Text>

                <Text className="text-base">
                  Thanks for giving the pro version a try!
                </Text>

                <Text className="text-base">
                  Best wishes,
                  <br />
                  Samuel
                </Text>

                <Text className="text-base text-gray-500">
                  P.S. If you cancelled because of a technical issue or need help
                  with something, just let me know — I'm happy to help!
                </Text>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GoodbyeEmail;
