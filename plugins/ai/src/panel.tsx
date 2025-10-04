import { createRoot } from 'react-dom/client';
import { PluginV3Context } from 'altair-graphql-core/build/plugin/v3/context';
import { AltairV3Panel } from 'altair-graphql-core/build/plugin/v3/panel';
import Chat, { ChatProps } from './components/Chat/Chat';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import {
  maxMessageChars,
  maxGraphqlQueryChars,
  maxGraphqlVariablesChars,
  maxSdlChars,
} from 'altair-graphql-core/build/ai/constants';
import { IMessage, ISendMessageDto } from 'altair-graphql-core/build/ai/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

interface PanelProps {
  context: PluginV3Context;
}
const Panel = ({ context }: PanelProps) => {
  const { data: userInfo, isLoading: userInfoIsLoading } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => context.getUserInfo(),
  });

  const { data: activeSession, isLoading: activeSessionIsLoading } = useQuery({
    queryKey: ['activeSession'],
    queryFn: () => context.getActiveAiSession(),
    enabled: !!userInfo?.loggedIn,
  });

  const { data: availableCredits } = useQuery({
    queryKey: ['availableCredits'],
    queryFn: () => context.getAvailableCredits(),
    enabled: !!userInfo?.loggedIn,
  });

  const { data: messages, isLoading: messagesIsLoading } = useQuery({
    queryKey: ['sessionMessages', activeSession?.id],
    queryFn: () =>
      activeSession
        ? context.getAiSessionMessages(activeSession.id)
        : Promise.resolve([]),
    enabled: !!activeSession?.id,
  });

  const { mutate: createAiSession, isPending: createSessionIsPending } = useMutation(
    {
      mutationKey: ['createAiSession'],
      mutationFn: () => context.createAiSession(),
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: ['activeSession'] });
        await queryClient.invalidateQueries({ queryKey: ['sessionMessages'] });
      },
    }
  );

  const {
    mutate: sendMessage,
    isPending: sendMessageIsPending,
    error,
  } = useMutation({
    mutationKey: ['sendMessage'],
    mutationFn: async (message: string) => {
      if (!activeSession) {
        throw new Error('No active session');
      }

      const windowState = await context.getCurrentWindowState();
      let graphqlQuery = '';
      let graphqlVariables = '';
      let sdl = '';
      let response = '';
      if (windowState) {
        graphqlQuery = windowState.query;
        graphqlVariables = windowState.variables;
        sdl = windowState.sdl;
        response = windowState.queryResults.join('\n');
      }

      // build message input
      const input: ISendMessageDto = {
        message: message.slice(0, maxMessageChars),
        graphqlQuery: graphqlQuery.slice(0, maxGraphqlQueryChars),
        graphqlVariables: graphqlVariables.slice(0, maxGraphqlVariablesChars),
        sdl: sdl.slice(0, maxSdlChars),
        graphqlResponse: response,
      };
      return context.sendMessageToAiSession(activeSession.id, input);
    },
    onMutate: async (message) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['sessionMessages'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<IMessage[]>([
        'sessionMessages',
      ]);

      const sessionId = activeSession?.id ?? '';
      const fakeMessage: IMessage = {
        id: Math.random().toString(),
        message: message,
        role: 'USER',
        sessionId,
      };
      // Optimistically update to the new value
      queryClient.setQueryData<IMessage[]>(['sessionMessages', sessionId], (old) => [
        ...(old ?? []),
        fakeMessage,
      ]);

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_err, _message, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['todos'], context.previousMessages);
      }
    },
    // Always refetch after error or success:
    onSettled: async () => {
      // wait for the refetching to complete before marking as not pending
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessionMessages'] }),
        queryClient.invalidateQueries({ queryKey: ['availableCredits'] }),
      ]);
    },
  });

  if (error) {
    console.error(error);
  }

  const chatProps: ChatProps = {
    loggedIn: !!userInfo?.loggedIn,
    loading:
      userInfoIsLoading ||
      activeSessionIsLoading ||
      messagesIsLoading ||
      createSessionIsPending,
    userInfo,
    activeSession,
    messages,
    sendMessageIsPending,
    availableCredits: availableCredits?.total ?? 0,
    isPro: userInfo?.plan?.id === 'pro',
    onStartNewSession() {
      createAiSession();
    },
    onSendMessage(message) {
      sendMessage(message);
    },
    async onUseQuery(query) {
      const windowState = await context.getCurrentWindowState();
      if (!windowState) {
        return;
      }
      await context.setQuery(windowState.windowId, query);
    },
    async onRateMessage(messageId, rating) {
      if (!activeSession) {
        return;
      }
      await context.rateAiSessionMessage(activeSession.id, messageId, rating);
      toast('Thank you for your feedback!');
    },
  };

  return (
    <>
      <Chat {...chatProps} />
      <Toaster />
    </>
  );
};

export class AiPluginPanel extends AltairV3Panel {
  create(ctx: PluginV3Context, container: HTMLElement): void {
    const root = createRoot(container);
    root.render(
      <QueryClientProvider client={queryClient}>
        <Panel context={ctx} />
      </QueryClientProvider>
    );
  }
}
