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
  Select,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  addTeamMember,
  createTeam,
  FirebaseUtilsContext,
  getTeamMembers,
  getTeams,
  updateTeam,
} from 'altair-firebase-utils';
import useUser from '../../lib/useUser';
import { notify } from '../../lib/notify';
import {
  Team,
  TeamId,
} from 'altair-graphql-core/build/types/state/account.interfaces';
import Link from 'next/link';
import {
  TeamMembership,
  TeamRole,
} from 'altair-firebase-utils/build/interfaces';
import { TEAM_ROLES } from 'altair-firebase-utils/build/constants';
import { useRouter } from 'next/router';

interface MembersStackProps {
  members: TeamMembership[];
}

interface MembershipData {
  email: string;
  role: TeamRole;
}
interface MemberFormProps {
  teamId: string;
  onComplete: (success: boolean) => void;
}

function MemberForm({ onComplete, teamId }: MemberFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<MembershipData>({
    initialValues: {
      email: '',
      role: TEAM_ROLES.MEMBER,
    },
    validate: {
      email: (val) => (!val ? 'Email is required' : null),
    },
  });
  const { ctx } = useUser();

  if (!ctx) {
    return null;
  }

  const onCreateMember = async (val: MembershipData) => {
    setLoading(true);
    try {
      await addTeamMember(ctx, { ...val, teamUid: teamId });
      notify.success('Your team member has been added');
      onComplete(true);
    } catch (err) {
      console.error(err);
      notify.error('An error occurred while adding your team member');
      onComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={form.onSubmit((val) => onCreateMember(val))}>
        <TextInput
          label="Email address"
          withAsterisk
          value={form.values.email}
          onChange={(event) =>
            form.setFieldValue('email', event.currentTarget.value)
          }
          {...form.getInputProps('email')}
        />
        <Select
          label="Role"
          placeholder="Pick one"
          data={[
            { value: TEAM_ROLES.MEMBER, label: 'Member' },
            { value: TEAM_ROLES.ADMIN, label: 'Admin' },
          ]}
          value={form.values.role}
          onChange={(value) =>
            form.setFieldValue('role', (value as TeamRole) ?? TEAM_ROLES.MEMBER)
          }
          {...form.getInputProps('role')}
        />

        <Group position="right" mt="xl">
          <Button type="submit" loading={loading}>
            {'Create member'}
          </Button>
        </Group>
      </form>
    </>
  );
}

function MembersStack({ members }: MembersStackProps) {
  const rows = members.map((member) => (
    <tr key={member.id}>
      <td>
        <Group spacing="sm">
          <div>
            <Text size="sm" weight={500}>
              {member.email}
            </Text>
            <Text color="dimmed" size="xs">
              {member.role}
            </Text>
          </div>
        </Group>
      </td>
      <td>
        <Group spacing={0} position="right">
          <ActionIcon
            color="red"
            onClick={() => {
              /* TODO: */
            }}
          >
            <IconTrash size={16} stroke={1.5} />
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

export default function TeamPage() {
  const router = useRouter();
  const { id } = router.query;
  const [memberModalOpened, setMemberModalOpened] = useState(false);
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const { ctx } = useUser();

  const loadTeam = useCallback(
    async (ctx: FirebaseUtilsContext) => {
      try {
        if (!id) {
          throw new Error('Team ID cannot be undefined');
        }
        const teams = await getTeamMembers(ctx, new TeamId(id.toString()));
        setMembers(teams);
      } catch (err) {
        console.error(err);
        notify.error('Could not load team members');
      }
    },
    [id]
  );

  useEffect(() => {
    if (!ctx) {
      return;
    }
    loadTeam(ctx);
  }, [ctx, loadTeam]);

  if (!ctx || !id) {
    return null;
  }
  const onCompleteAddMember = async (success: boolean) => {
    if (success) {
      setMemberModalOpened(false);
      await loadTeam(ctx);
    }
  };

  return (
    <>
      <Modal
        opened={memberModalOpened}
        onClose={() => setMemberModalOpened(false)}
        title={'New member'}
      >
        <MemberForm onComplete={onCompleteAddMember} teamId={id.toString()} />
      </Modal>
      <Group position="apart">
        <Title>Members</Title>
        <Button onClick={() => setMemberModalOpened(true)}>Add member</Button>
      </Group>
      <MembersStack members={members} />
    </>
  );
}
