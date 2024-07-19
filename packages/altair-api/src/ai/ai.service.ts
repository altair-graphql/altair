import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreditService } from 'src/credit/credit.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AiChatMessage, AiChatRating, AiChatRole } from '@altairgraphql/db';
import { PrismaService } from 'nestjs-prisma';
import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import {
  maxGraphqlQueryChars,
  maxGraphqlVariablesChars,
  maxMessageChars,
  maxSdlChars,
} from 'altair-graphql-core/build/cjs/ai/constants';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/common/config';
import dedent from 'dedent';

@Injectable()
export class AiService {
  constructor(
    private readonly creditService: CreditService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Config>
  ) {}

  async createNewActiveSession(userId: string) {
    // Only one active session per user
    const res = await this.prisma.aiChatSession.updateMany({
      where: {
        userId,
      },
      data: {
        isActive: false,
      },
    });

    return this.prisma.aiChatSession.create({
      data: {
        userId,
        isActive: true,
        title: `Session ${res.count + 1} (${new Date().toISOString()})`,
      },
    });
  }

  async getActiveSession(userId: string) {
    return this.prisma.aiChatSession.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async getSession(userId: string, sessionId: string) {
    return this.prisma.aiChatSession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
    });
  }

  getSessions(userId: string) {
    return this.prisma.aiChatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  getSessionMessages(userId: string, sessionId: string, limit = Infinity) {
    return this.prisma.aiChatMessage.findMany({
      where: {
        sessionId,
        AiChatSession: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      ...(limit < Infinity
        ? {
            take: limit,
          }
        : {}),
    });
  }

  async getOrCreateActiveSession(userId: string) {
    const session = await this.getActiveSession(userId);
    if (session) {
      return session;
    }
    return this.createNewActiveSession(userId);
  }

  async rateMessage({
    userId,
    sessionId,
    messageId,
    rating,
  }: {
    userId: string;
    sessionId: string;
    messageId: string;
    rating: number;
  }) {
    return this.prisma.aiChatMessage.update({
      where: {
        id: messageId,
        sessionId,
        role: AiChatRole.ASSISTANT, // Only rate AI messages
        AiChatSession: {
          userId,
        },
      },
      data: {
        rating: rating > 0 ? AiChatRating.GOOD : AiChatRating.BAD,
      },
    });
  }

  async sendMessage(
    userId: string,
    sessionId: string,
    messageInput: SendMessageDto
  ) {
    // Validate message input
    if (!messageInput.message) {
      throw new BadRequestException('Message is required');
    }
    if (messageInput.message.length > maxMessageChars) {
      throw new BadRequestException('Message is too long');
    }
    if (messageInput.sdl && messageInput.sdl.length > maxSdlChars) {
      throw new BadRequestException('SDL is too long');
    }
    if (
      messageInput.graphqlQuery &&
      messageInput.graphqlQuery.length > maxGraphqlQueryChars
    ) {
      throw new BadRequestException('GraphQL query is too long');
    }
    if (
      messageInput.graphqlVariables &&
      messageInput.graphqlVariables.length > maxGraphqlVariablesChars
    ) {
      throw new BadRequestException('GraphQL variables is too large');
    }

    const session = await this.getSession(userId, sessionId);
    if (!session) {
      throw new BadRequestException('Session not found');
    }

    const messages = await this.prisma.aiChatMessage.findMany({
      where: {
        sessionId,
      },
    });

    // Use credit
    const creditUse = await this.creditService.useCredits(userId, 1);

    // Send message (+ all previous messages in session) to AI
    const response = await this.sendToAI(messageInput, messages);
    // Save user message to session
    await this.prisma.aiChatMessage.create({
      data: {
        sessionId,
        message: messageInput.message,
        role: AiChatRole.USER,
        sdl: messageInput.sdl,
        graphqlQuery: messageInput.graphqlQuery,
        graphqlVariables: messageInput.graphqlVariables,
        transactionId: creditUse.transactionId,
      },
    });
    // Save AI response to session
    await this.prisma.aiChatMessage.create({
      data: {
        sessionId,
        message: response.content,
        role: AiChatRole.ASSISTANT,
        inputTokens: response.usage_metadata?.input_tokens,
        outputTokens: response.usage_metadata?.output_tokens,
      },
    });
    // Update session updated_at
    await this.prisma.aiChatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
    // Return AI response
    return {
      response: response.content,
    };
  }

  private async sendToAI(
    messageInput: SendMessageDto,
    previousMessages: AiChatMessage[]
  ) {
    const model = this.getChatModel();

    // https://platform.openai.com/docs/guides/prompt-engineering
    const systemMessageParts = [
      'I want you to act as a friendly and helpful expert of GraphQL and Altair GraphQL Client (https://altairgraphql.dev).',
      'Only answer questions related to GraphQL and Altair GraphQL Client.',
      'Be concise and clear in your responses.',
      'Write your responses in markdown format.',
      'Always wrap GraphQL queries in ```graphql``` code blocks.',
    ];
    // Use additional message context to enhance the system message
    if (messageInput.sdl) {
      systemMessageParts.push(dedent`
        Here is the SDL (schema) provided by the user:
        <sdl>
        ${messageInput.sdl}
        </sdl>
      `);
    }
    if (messageInput.graphqlQuery) {
      systemMessageParts.push(dedent`
        Here is the GraphQL query provided by the user:
        <graphql>
        ${messageInput.graphqlQuery}
        </graphql>
      `);
    }
    if (messageInput.graphqlVariables) {
      systemMessageParts.push(dedent`
        Here are the GraphQL variables (in JSON) provided by the user:
        <graphql-variables>
        ${messageInput.graphqlVariables}
        </graphql-variables>
      `);
    }
    const promptTemplate = ChatPromptTemplate.fromMessages([
      new SystemMessage(systemMessageParts.join('\n')),
      ...previousMessages.map((m) => {
        if (m.role === AiChatRole.USER) {
          return new HumanMessage(m.message);
        }
        return new AIMessage(m.message);
      }),
      new HumanMessage('{text}'),
    ]);

    const chain = promptTemplate.pipe(model);

    // Pass variables to invoke (variables are wrapped in curly braces)
    const response = await chain.invoke({
      text: messageInput.message,
    });
    const parser = new StringOutputParser();
    const out = await parser.invoke(response);
    return {
      content: out,
      // FIXME: Is there a better way?
      usage_metadata:
        'usage_metadata' in response
          ? (response as AIMessage).usage_metadata
          : undefined,
    };
  }

  // Get chat model based on environment variables
  private getChatModel(): BaseChatModel {
    const modelProvider = this.configService.get('ai.modelProvider', {
      infer: true,
    });
    switch (modelProvider) {
      case 'openai': {
        return new ChatOpenAI({
          apiKey: this.configService.get('ai.openai.apiKey', { infer: true }),
          model: this.configService.get('ai.openai.model', { infer: true }),
        });
      }
      case 'ollama': {
        return new ChatOllama({
          baseUrl: this.configService.get('ai.ollama.baseUrl', { infer: true }),
          model: this.configService.get('ai.ollama.model', { infer: true }),
        });
      }
      case 'fake': {
        return new FakeListChatModel({
          responses: [
            'Certainly! Here is a GraphQL query to fetch all users along with their names and email addresses:\n\n```graphql\nquery {\n  users {\n    id\n    name\n    email\n  }\n}\n```\n\nMake sure your GraphQL server schema includes a `users` query that returns a list of user objects, each containing `id`, `name`, and `email` fields.',
            'Sure! Here is a GraphQL query to fetch a list of products along with their prices and availability status:\n\n```graphql\nquery {\n  products {\n    id\n    name\n    price\n    availabilityStatus\n  }\n}```\n\nMake sure your GraphQL server schema includes a `products` query that returns a list of product objects, each containing `id`, `name`, `price`, and `availabilityStatus` fields.',
            'Certainly! Here is an example of how the `User` type might be defined in a GraphQL schema, along with an explanation of each field:\n\n```graphql\ntype User {\n  id: ID!\n  name: String!\n  email: String!\n  age: Int\n  createdAt: String!\n}\n```\n\n### Explanation\n\n- **`id: ID!`**\n  - **Type:** `ID`\n  - **Non-nullable:** Yes\n  - **Description:** A unique identifier for the user.\n\n- **`name: String!`**\n  - **Type:** `String`\n  - **Non-nullable:** Yes\n  - **Description:** The name of the user.\n\n- **`email: String!`**\n  - **Type:** `String`\n  - **Non-nullable:** Yes\n  - **Description:** The email address of the user.\n\n- **`age: Int`**\n  - **Type:** `Int`\n  - **Non-nullable:** No\n  - **Description:** The age of the user (optional field).\n\n- **`createdAt: String!`**\n  - **Type:** `String`\n  - **Non-nullable:** Yes\n  - **Description:** The timestamp of when the user was created, typically in ISO 8601 format.\n\nThis `User` type defines the structure of user objects in the GraphQL schema, specifying the fields available and their data types. The `!` after a type indicates that the field is non-nullable, meaning it must have a value.',
            'Sure! Here are the fields available in the `Product` type and their corresponding types:\n\n```graphql\ntype Product {\n  id: ID!\n  name: String!\n  price: Float!\n  availabilityStatus: String!\n}\n```\n\n### Fields\n\n- **`id: ID!`**\n  - **Type:** `ID`\n  - **Non-nullable:** Yes\n  - **Description:** A unique identifier for the product.\n\n- **`name: String!`**\n  - **Type:** `String`\n  - **Non-nullable:** Yes\n  - **Description:** The name of the product.\n\n- **`price: Float!`**\n  - **Type:** `Float`\n  - **Non-nullable:** Yes\n  - **Description:** The price of the product.\n\n- **`availabilityStatus: String!`**\n  - **Type:** `String`\n  - **Non-nullable:** Yes\n  - **Description:** The availability status of the product (e.g., "In Stock", "Out of Stock").\n\nThese fields define the structure of product objects in the GraphQL schema, specifying the information available for each product.',
            'Certainly! Here is a GraphQL query to fetch a list of posts along with their titles and authors:\n\n```graphql\nquery {\n  posts {\n    id\n    title\n    author {\n      id\n      name\n    }\n  }\n}```\n\nMake sure your GraphQL server schema includes a `posts` query that returns a list of post objects, each containing `id`, `title`, and `author` fields.',
          ],
        });
      }
      case 'anthropic':
      default: {
        return new ChatAnthropic({
          apiKey: this.configService.get('ai.anthropic.apiKey', { infer: true }),
          model: this.configService.get('ai.anthropic.model', { infer: true }),
        });
      }
    }
  }
}
