import {
  Text,
  Paper,
  Group,
  Button,
  Container,
  AppShell,
} from '@mantine/core';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import { firebaseClient } from '../lib/useUser';
import { NextPageWithLayout } from './_app';

const Login: NextPageWithLayout = () => {
  const router = useRouter();
  const onSigninWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(firebaseClient.auth, provider);
    router.push('/');
  };
  return (
    <Container size='xs'>
      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" weight={500}>
          Welcome back!
        </Text>

        <Group grow mb="md" mt="md">
          <Button onClick={() => onSigninWithGoogle()}>Signin with Google</Button>
        </Group>
      </Paper>
    </Container>
  );
}

Login.PageLayout = function PageLayout({ page }) {
  return (
    <AppShell
      padding="md"
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
      {page}
    </AppShell>
  )
}
export default Login;
