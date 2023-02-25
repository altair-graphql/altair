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
  Select,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconTrash } from '@tabler/icons';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { apiClient } from '../../lib/useUser';
import { notify } from '../../lib/notify';
import { useRouter } from 'next/router';
import { TeamMemberRole } from '@altairgraphql/db';
import { ReturnedTeamMembership } from '@altairgraphql/api-utils';

interface MembersStackProps {
  members: ReturnedTeamMembership[];
}

interface MembershipData {
  email: string;
  role: TeamMemberRole;
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
      role: TeamMemberRole.MEMBER,
    },
    validate: {
      email: (val) => (!val ? 'Email is required' : null),
    },
  });

  const onCreateMember = async (val: MembershipData) => {
    setLoading(true);
    try {
      await apiClient.addTeamMember({ ...val, teamId });
      notify.success('Your team member has been added');
      onComplete(true);
    } catch (err) {
      // console.error(err);
      notify.error(
        'An error occurred while adding your team member. Please make sure that user already exists before trying to add as a team member.'
      );
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
            { value: TeamMemberRole.MEMBER, label: 'Member' },
            { value: TeamMemberRole.ADMIN, label: 'Admin' },
          ]}
          value={form.values.role}
          onChange={(value) =>
            form.setFieldValue(
              'role',
              (value as TeamMemberRole) ?? TeamMemberRole.MEMBER
            )
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
    <tr key={member.userId}>
      <td>
        <Group spacing="sm">
          <div>
            <Text size="sm" weight={500}>
              {member.user.firstName}
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
  const [members, setMembers] = useState<ReturnedTeamMembership[]>([]);

  const loadTeam = useCallback(async (id: string) => {
    try {
      if (!id) {
        throw new Error('Team ID cannot be undefined');
      }
      const members = await apiClient.getTeamMembers(id.toString());
      setMembers(members);
    } catch (err) {
      // console.error(err);
      notify.error('Could not load team members');
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadTeam(id.toString());
    }
  }, [id, loadTeam]);

  if (!id) {
    return null;
  }
  const onCompleteAddMember = async (success: boolean) => {
    if (success) {
      setMemberModalOpened(false);
      if (id) {
        await loadTeam(id.toString());
      }
    }
  };

  return (
    <>
      <Modal
        opened={memberModalOpened}
        onClose={() => setMemberModalOpened(false)}
        title={'New member'}
      >
        <Alert color="yellow">
          The user must already exist to add them as a team member
        </Alert>
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
