import {
  Table,
  Group,
  Text,
  ActionIcon,
  ScrollArea,
  Title,
  Button,
  Modal,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconPencil } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import useUser, { apiClient } from '../../lib/useUser';
import { notify } from '../../lib/notify';
import { Team } from 'altair-graphql-core/build/types/state/account.interfaces';
import Link from 'next/link';

interface TeamsStackProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
}

interface TeamData {
  name: string;
  description: string;
}
interface TeamFormProps {
  onComplete: (success: boolean) => void;
  team?: Team;
}

function TeamForm({ onComplete, team }: TeamFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      name: team?.name ?? '',
      description: team?.description ?? '',
    },
    validate: {
      name: (val) => (!val ? 'Name is required' : null),
    },
  });
  const isCreate = !team;

  const onCreateTeam = async (val: TeamData) => {
    setLoading(true);
    try {
      await apiClient.createTeam(val);
      notify.success('Your team has been created');
      onComplete(true);
    } catch (err) {
      // console.error(err);
      notify.error('An error occurred while creating your team');
      onComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateTeam = async (val: TeamData) => {
    if (!team) {
      notify.error('Cannot update team because the team is not found');
      return;
    }
    setLoading(true);
    try {
      await apiClient.updateTeam(team.id, val);
      notify.success('Your team has been updated');
      onComplete(true);
    } catch (err) {
      // console.error(err);
      notify.error('An error occurred while updating your team');
      onComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={form.onSubmit((val) =>
          isCreate ? onCreateTeam(val) : onUpdateTeam(val)
        )}
      >
        <TextInput
          label="Team name"
          withAsterisk
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue('name', event.currentTarget.value)
          }
          {...form.getInputProps('name')}
        />
        <Textarea
          label="Description"
          value={form.values.description}
          onChange={(event) =>
            form.setFieldValue('description', event.currentTarget.value)
          }
          {...form.getInputProps('description')}
        />

        <Group position="right" mt="xl">
          <Button type="submit" loading={loading}>
            {isCreate ? 'Create team' : 'Update team'}
          </Button>
        </Group>
      </form>
    </>
  );
}

function TeamsStack({ teams, onEditTeam }: TeamsStackProps) {
  const rows = teams.map((team) => (
    <tr key={team.id}>
      <td>
        <Group spacing="sm">
          <div>
            <Text size="sm" weight={500}>
              <Link href={`/teams/${team.id}`}>{team.name}</Link>
            </Text>
            <Text color="dimmed" size="xs">
              {team.description}
            </Text>
          </div>
        </Group>
      </td>
      <td>
        <Group spacing={0} position="right">
          <ActionIcon onClick={() => onEditTeam(team)}>
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table sx={{ minWidth: 800 }} verticalSpacing="md">
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export default function Teams() {
  const [{ team, teamModalOpened }, setTeamModalState] = useState<{
    team?: Team;
    teamModalOpened: boolean;
  }>({ team: undefined, teamModalOpened: false });
  const [teams, setTeams] = useState<Team[]>([]);

  const loadTeam = async () => {
    try {
      const teams = await apiClient.getTeams();
      setTeams(
        teams.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description ? t.description : undefined,
        }))
      );
    } catch (err) {
      // console.error(err);
      notify.error('Could not load teams');
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const onCompleteCreateTeam = async (success: boolean) => {
    if (success) {
      setTeamModalState({ team: undefined, teamModalOpened: false });
      await loadTeam();
    }
  };

  return (
    <>
      <Modal
        opened={teamModalOpened}
        onClose={() =>
          setTeamModalState({ team: undefined, teamModalOpened: false })
        }
        title={team ? 'Edit team' : 'New team'}
      >
        <TeamForm onComplete={onCompleteCreateTeam} team={team} />
      </Modal>
      <Group position="apart">
        <Title>Teams</Title>
        <Button
          onClick={() =>
            setTeamModalState({ team: undefined, teamModalOpened: true })
          }
        >
          Create team
        </Button>
      </Group>
      <TeamsStack
        teams={teams}
        onEditTeam={(team) =>
          setTeamModalState({ team, teamModalOpened: true })
        }
      />
    </>
  );
}
