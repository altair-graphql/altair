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
  IconArrowUpRight,
  IconArrowDownRight,
} from '@tabler/icons';
import useUser from '../lib/useUser';

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

  if (!user) {
    return null;
  }

  return (
    <>
      <Title order={3}>Welcome back, {user.firstName}!</Title>
      {/* <StatsGrid
        data={[
          {
            title: 'Queries',
            value: '2',
            icon: 'user',
          },
          {
            title: 'Collections',
            value: '1',
            icon: 'user',
          },
          {
            title: 'Teams',
            value: '2',
            icon: 'user',
          },
        ]}
      /> */}
    </>
  );
}
