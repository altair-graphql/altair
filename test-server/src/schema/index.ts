import { merge } from 'lodash';
import * as GOTCharacter from './GOTCharacter';
import * as GOTBook from './GOTBook';
import * as GOTHouse from './GOTHouse';
import * as HNUser from './HNUser';
import * as Message from './Message';
import * as File from './File';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const rootTypeDef = `#graphql
  scalar File
  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI @deprecated(reason: "We do not talk about this one")
  }
  type Query {
    hello: String
    bye: Boolean @deprecated(reason: "We do not say bye")
    randomEpisode: Episode

    """
    Do you want to know the alphabet?
    """
    alphabet: [String!]!
    """
    A field that resolves fast.
    """
    fastField: String!
 
    """
    A field that resolves slowly.
    Maybe you want to @defer this field ;)
    """
    slowField(waitFor: Int! = 5000, forDepth: Int @deprecated(reason: "For testing arg deprecation")): String
  }
  type Mutation
  type Subscription {
    greetingsSSE: String
    countdown(from: Int!): Int!
  }
`;

const rootResolvers = {
  Query: {
    hello: () => 'Hello world',
    bye: () => true,
    randomEpisode: () => {
      const episodes = ['NEWHOPE', 'EMPIRE', 'JEDI'];
      return episodes[Math.floor(Math.random() * episodes.length)];
    },
    async *alphabet() {
      for (const character of 'abcdefghijklmnopqrstuvwxyz') {
        yield character;
        await wait(1000);
      }
    },
    fastField: async () => {
      await wait(1000);
      return 'This field resolves fast! ⚡️';
    },
    slowField: async (_: any, { waitFor }: { waitFor: number }) => {
      await wait(waitFor);
      return `This field resolves slowly after ${waitFor}ms ⏳`;
    },
  },
  Subscription: {
    greetingsSSE: {
      subscribe: async function* () {
        for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          yield { greetingsSSE: hi };
        }
      },
    },
    countdown: {
      subscribe: async function* (_: any, { from }: { from: number }) {
        for (let i = from; i >= 0; i--) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          yield { countdown: i };
        }
      },
    },
  },
};

export const typeDefs = [
  rootTypeDef,
  GOTCharacter.typeDef,
  GOTBook.typeDef,
  GOTHouse.typeDef,
  HNUser.typeDef,
  Message.typeDef,
  File.typeDef,
];

export const resolvers = merge(
  rootResolvers,
  GOTCharacter.resolvers,
  GOTBook.resolvers,
  GOTHouse.resolvers,
  HNUser.resolvers,
  Message.resolvers,
  File.resolvers
);
