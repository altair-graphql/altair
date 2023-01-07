import {
  AppShell,
  Container,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { PropsWithChildren, useState } from 'react';
import { NavbarSimple } from './Navbar';

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    minHeight: 650,
  },
}));

export function Layout({ children }: PropsWithChildren) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  return (
    <>
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === 'dark'
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={<NavbarSimple />}
      >
        <Container size="lg" className={classes.wrapper}>
          {children}
        </Container>
      </AppShell>
    </>
  );
}
