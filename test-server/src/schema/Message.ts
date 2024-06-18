import { PubSub } from 'graphql-subscriptions';

const messageRepository = [];

export const typeDef = `#graphql
  extend type Mutation {
    addMessage(content: String): Message
  }
  extend type Subscription {
    messageAdded: Message
  }

  type Message {
    id: Int!
    content: String
    author: String
  }
`;

const pubsub = new PubSub();
export const resolvers = {
  Mutation: {
    addMessage(root: any, { content = '' }, { req }: any) {
      const message = {
        id: messageRepository.length + 1,
        content,
        author: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      };
      messageRepository.push(message);
      pubsub.publish('MESSAGE_ADDED', { messageAdded: message });

      return message;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe() {
        return pubsub.asyncIterator('MESSAGE_ADDED');
      },
    },
  },
};
