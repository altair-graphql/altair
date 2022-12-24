import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { Layout } from '../components/Layout';
import useUser from '../lib/useUser';
import { NotificationsProvider } from '@mantine/notifications';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

interface PageLayoutProps {
  page: ReactElement;
}
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  PageLayout?: (props: PageLayoutProps) => JSX.Element;
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const getDefaultLayout = ({page}: PageLayoutProps) => {
  return (
    <Layout>{page}</Layout>
  );
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const PageLayout = Component.PageLayout ?? getDefaultLayout;

  const { user } = useUser();

  return (
    <>
      <Head>
        <title>Altair Cloud Sync</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
        }}
      >
        <NotificationsProvider position='top-center'>
          <PageLayout page={<Component {...pageProps} />} />
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
}
