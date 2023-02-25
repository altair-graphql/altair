import { useState } from 'react';
import {
  createStyles,
  Navbar,
  Group,
  Code,
  useMantineColorScheme,
  Button,
  UnstyledButton,
} from '@mantine/core';
import {
  IconBellRinging,
  IconFingerprint,
  IconKey,
  IconSettings,
  Icon2fa,
  IconDatabaseImport,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
  IconHome2,
  IconUsers,
  IconSun,
  IconMoonStars,
  IconBug,
} from '@tabler/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiClient } from '../lib/useUser';

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: theme.fontSizes.sm,
      width: '100%',
      color:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      '&:hover': {
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      '&, &:hover': {
        backgroundColor: theme.fn.variant({
          variant: 'light',
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
          .color,
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: 'light',
            color: theme.primaryColor,
          }).color,
        },
      },
    },
  };
});

const openBillingPage = async () => {
  const res = await apiClient.getBillingUrl();

  window.open(res.url, '_blank');
};

const data = [
  // { link: '/', label: 'Overview', icon: IconHome2 },
  { link: '/teams', label: 'Teams', icon: IconUsers },
  {
    link: '/billing',
    label: 'Billing',
    icon: IconReceipt2,
    onClick: () => openBillingPage(),
  },
  // { link: '/', label: 'Other Settings', icon: IconSettings },
];

export function NavbarSimple() {
  const { classes, cx } = useStyles();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const links = data.map((item) => {
    const Component = item.onClick ? UnstyledButton : Link;
    return (
      <Component
        className={cx(classes.link, {
          [classes.linkActive]: router.pathname.startsWith(item.link),
        })}
        href={item.link}
        key={item.label}
        onClick={item.onClick}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </Component>
    );
  });

  return (
    <Navbar width={{ sm: 300 }} p="md">
      <Navbar.Section grow>
        <Group className={classes.header} position="left">
          <Image
            src="/logo.svg"
            alt="Altair GraphQL Logo"
            width={60}
            height={60}
            priority
          />
          Altair GraphQL Cloud
        </Group>
        {links}
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <UnstyledButton
          className={classes.link}
          onClick={() => toggleColorScheme()}
        >
          {colorScheme === 'dark' ? (
            <IconSun className={classes.linkIcon} stroke={1.5} />
          ) : (
            <IconMoonStars className={classes.linkIcon} stroke={1.5} />
          )}
          <span>Toggle theme</span>
        </UnstyledButton>
        <a
          href="https://github.com/altair-graphql/altair/issues/new/choose"
          className={classes.link}
          target="_blank"
          rel="noreferrer"
        >
          <IconBug className={classes.linkIcon} stroke={1.5} />
          <span>Report issues</span>
        </a>
        <UnstyledButton
          className={classes.link}
          onClick={() => {
            apiClient.signOut();
            router.push('/');
          }}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </UnstyledButton>
      </Navbar.Section>
    </Navbar>
  );
}
