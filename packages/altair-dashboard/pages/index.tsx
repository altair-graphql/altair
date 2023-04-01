import { IUserStats } from '@altairgraphql/api-utils';
import {
  createStyles,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core';
import {
  IconUserPlus,
  IconDiscount2,
  IconReceipt2,
  IconCoin,
  IconArticle,
  IconBooks,
  IconUsers,
  IconArrowUpRight,
  IconArrowDownRight,
} from '@tabler/icons';
import { useEffect, useState } from 'react';
import useUser, { apiClient } from '../lib/useUser';

const useStyles = createStyles((theme) => ({
  root: {
    paddingBlock: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },

  icon: {
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: 'uppercase',
  },
}));

const icons = {
  user: IconUserPlus,
  users: IconUsers,
  books: IconBooks,
  article: IconArticle,
  discount: IconDiscount2,
  receipt: IconReceipt2,
  coin: IconCoin,
};

interface StatsGridProps {
  data: { title: string; icon: keyof typeof icons; value: string }[];
}

// Overview - # of teams, collections, queries
export function StatsGrid({ data }: StatsGridProps) {
  const { classes } = useStyles();
  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];

    return (
      <Grid.Col md={6} lg={3} key={stat.title}>
        <Paper withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              {stat.title}
            </Text>
            <Icon className={classes.icon} size={22} stroke={1.5} />
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{stat.value}</Text>
          </Group>
        </Paper>
      </Grid.Col>
    );
  });
  return (
    <div className={classes.root}>
      <Grid grow>{stats}</Grid>
    </div>
  );
}

export default function Home() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<IUserStats>();

  useEffect(() => {
    (async () => {
      const stats = await apiClient.getUserStats();
      setUserStats(stats);
    })();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <>
      <Title order={3}>Welcome back, {user.firstName}!</Title>
      {/* TODO: Tooltip: explain that this is query/collection/team that you have access to. Not that you own or manage. */}
      <StatsGrid
        data={[
          {
            title: 'Queries',
            value: `${userStats?.queries.own ?? 0}`,
            icon: 'article',
          },
          {
            title: 'Collections',
            value: `${userStats?.collections.own ?? 0}`,
            icon: 'books',
          },
          {
            title: 'Teams',
            value: `${userStats?.teams.own ?? 0}`,
            icon: 'users',
          },
        ]}
      />
    </>
  );
}
