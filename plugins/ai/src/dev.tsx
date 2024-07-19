import React from 'react';
import ReactDOM from 'react-dom/client';
import Chat, { ChatProps } from './components/Chat/Chat';

const chatProps: ChatProps = {
  loggedIn: true,
  loading: false,
  sendMessageIsPending: true,
  availableCredits: 0,
  activeSession: {
    id: '1',
    isActive: true,
    title: 'title',
    userId: 'user-1',
  },
  messages: [
    {
      id: '1',
      message:
        'Can you generate a GraphQL query to fetch all users with their names and email addresses?',
      role: 'USER',
      sessionId: '1',
    },
    {
      id: '2',
      message:
        'Certainly! Here is a GraphQL query to fetch all users along with their names and email addresses:\n\n```graphql\nquery {\n  users {\n    id\n    name\n    email\n  }\n}\n```\n\nMake sure your GraphQL server schema includes a `users` query that returns a list of user objects, each containing `id`, `name`, and `email` fields.',
      role: 'ASSISTANT',
      sessionId: '1',
    },
  ],
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Chat {...chatProps} />
  </React.StrictMode>
);
