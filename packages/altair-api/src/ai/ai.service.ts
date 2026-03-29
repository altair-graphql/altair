import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreditService } from 'src/credit/credit.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AiChatMessage, AiChatRating, AiChatRole } from '@altairgraphql/db';
import { PrismaService } from 'nestjs-prisma';
import { ChatOpenAI } from '@langchain/openai';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import {
  maxGraphqlQueryChars,
  maxGraphqlVariablesChars,
  maxMessageChars,
  maxSdlChars,
  responseMaxTokens,
} from 'altair-graphql-core/build/cjs/ai/constants';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/common/config';
import dedent from 'dedent';
import { getAgent } from 'src/newrelic/newrelic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { getPrompt } from './prompt';

@Injectable()
export class AiService {
  private readonly agent = getAgent();
  constructor(
    private readonly creditService: CreditService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Config>
  ) {}

  async createNewActiveSession(userId: string) {
    // Only one active session per user — use a transaction to prevent races
    return this.prisma.$transaction(async (tx) => {
      const res = await tx.aiChatSession.updateMany({
        where: {
          userId,
        },
        data: {
          isActive: false,
        },
      });

      this.agent?.incrementMetric('ai.session.create');

      return tx.aiChatSession.create({
        data: {
          userId,
          isActive: true,
          title: `Session ${res.count + 1} (${new Date().toISOString()})`,
        },
      });
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

  async getSessions(userId: string) {
    const res = await this.prisma.aiChatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    this.agent?.recordMetric('ai.session.count', res.length);

    return res;
  }

  async getSessionMessages(userId: string, sessionId: string, limit = Infinity) {
    const res = await this.prisma.aiChatMessage.findMany({
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

    this.agent?.recordMetric('ai.session.message.count', res.length);

    return res;
  }

  async getOrCreateActiveSession(userId: string) {
    const session = await this.getActiveSession(userId);
    if (session) {
      return session;
    }
    return this.createNewActiveSession(userId);
  }

  async renameSession(userId: string, sessionId: string, title: string) {
    const session = await this.getSession(userId, sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.aiChatSession.update({
      where: { id: sessionId, userId },
      data: { title },
    });
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.getSession(userId, sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Delete session and all its messages atomically
    await this.prisma.$transaction(async (tx) => {
      await tx.aiChatMessage.deleteMany({
        where: { sessionId },
      });
      await tx.aiChatSession.delete({
        where: { id: sessionId, userId },
      });
    });

    this.agent?.incrementMetric('ai.session.delete');

    return { deleted: true };
  }

  async resumeSession(userId: string, sessionId: string) {
    const session = await this.getSession(userId, sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Deactivate all sessions, then activate the target one
    return this.prisma.$transaction(async (tx) => {
      await tx.aiChatSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });
      return tx.aiChatSession.update({
        where: { id: sessionId, userId },
        data: { isActive: true },
      });
    });
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
    rating > 0
      ? this.agent?.incrementMetric('ai.message.rate.good')
      : this.agent?.incrementMetric('ai.message.rate.bad');

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
    const startTime = Date.now();

    try {
      const { messages, creditUse } = await this.prepareSendMessage(
        userId,
        sessionId,
        messageInput
      );

      // Send message (+ all previous messages in session) to AI
      const response = await this.sendToAI(messageInput, messages);

      this.agent?.incrementMetric('ai.session.message.send');

      if (response.usage_metadata) {
        const inputTokens = response.usage_metadata.input_tokens;
        const outputTokens = response.usage_metadata.output_tokens;
        if (inputTokens) {
          this.agent?.recordMetric('ai.message.tokens.input', inputTokens);
        }
        if (outputTokens) {
          this.agent?.recordMetric('ai.message.tokens.output', outputTokens);
        }
      }

      // Track provider used
      const modelProvider = this.configService.get('ai.modelProvider', {
        infer: true,
      });
      this.agent?.incrementMetric(`ai.provider.${modelProvider || 'anthropic'}`);

      // Save messages and update session atomically
      await this.saveMessagePair(
        sessionId,
        messageInput,
        response.content,
        creditUse.transactionId,
        response.usage_metadata
      );

      // Return AI response
      return {
        response: response.content,
      };
    } catch (error) {
      this.agent?.incrementMetric('ai.message.error');
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.agent?.recordMetric('ai.message.latency', duration);
    }
  }

  /**
   * Streaming variant of sendMessage. Returns an async generator that yields
   * text chunks as they arrive from the LLM, then persists the full exchange.
   */
  async *sendMessageStream(
    userId: string,
    sessionId: string,
    messageInput: SendMessageDto
  ): AsyncGenerator<{ type: 'chunk' | 'done' | 'error'; content: string }> {
    const startTime = Date.now();
    const { session, messages, creditUse } = await this.prepareSendMessage(
      userId,
      sessionId,
      messageInput
    );

    const chain = this.buildPromptChain(messageInput, messages);
    const parser = new StringOutputParser();
    const streamChain = chain.pipe(parser);

    let fullResponse = '';

    try {
      const stream = await streamChain.stream({});
      for await (const chunk of stream) {
        fullResponse += chunk;
        yield { type: 'chunk', content: chunk };
      }

      this.agent?.incrementMetric('ai.session.message.send');

      // Track provider used
      const modelProvider = this.configService.get('ai.modelProvider', {
        infer: true,
      });
      this.agent?.incrementMetric(`ai.provider.${modelProvider || 'anthropic'}`);

      // Save messages and update session atomically
      await this.saveMessagePair(
        sessionId,
        messageInput,
        fullResponse,
        creditUse.transactionId
      );

      yield { type: 'done', content: fullResponse };
    } catch (err) {
      this.agent?.incrementMetric('ai.message.error');
      yield {
        type: 'error',
        content: err instanceof Error ? err.message : 'Unknown error',
      };
    } finally {
      const duration = Date.now() - startTime;
      this.agent?.recordMetric('ai.message.latency', duration);
    }
  }

  /**
   * Shared validation + setup for both sendMessage and sendMessageStream.
   */
  private async prepareSendMessage(
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

    const allMessages = await this.prisma.aiChatMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Truncate context if it exceeds the configured limit
    const messages = await this.truncateContext(allMessages);

    // Use credit
    const creditUse = await this.creditService.useCredits(userId, 1);

    return { session, messages, creditUse };
  }

  /**
   * Truncate the message history to fit within `maxContextMessages`.
   * When truncation is needed, the oldest messages are dropped and a short
   * summary of the dropped conversation is prepended as a synthetic
   * ASSISTANT message so the LLM retains high-level context.
   */
  private async truncateContext(
    messages: AiChatMessage[]
  ): Promise<AiChatMessage[]> {
    const maxContextMessages =
      this.configService.get('ai.maxContextMessages', {
        infer: true,
      }) ?? 40;

    if (messages.length <= maxContextMessages) {
      return messages;
    }

    const dropCount = messages.length - maxContextMessages;
    const droppedMessages = messages.slice(0, dropCount);
    const keptMessages = messages.slice(dropCount);

    // Build a compact summary of the dropped messages
    const summary = await this.summarizeMessages(droppedMessages);

    // Create a synthetic assistant message containing the summary
    const syntheticSummary = {
      id: 'context-summary',
      sessionId: messages[0]!.sessionId,
      message: `[Context summary of ${droppedMessages.length} earlier messages]: ${summary}`,
      role: AiChatRole.ASSISTANT,
      transactionId: null,
      sdl: null,
      graphqlQuery: null,
      graphqlVariables: null,
      inputTokens: null,
      outputTokens: null,
      rating: null,
      createdAt: droppedMessages[0]!.createdAt,
      updatedAt: droppedMessages[0]!.createdAt,
    } as AiChatMessage;

    return [syntheticSummary, ...keptMessages];
  }

  /**
   * Generate a concise summary of a list of chat messages using the LLM.
   * Falls back to a simple extractive summary if the LLM call fails.
   */
  private async summarizeMessages(messages: AiChatMessage[]): Promise<string> {
    try {
      const model = this.getChatModel();
      const conversationText = messages
        .map(
          (m) =>
            `${m.role === AiChatRole.USER ? 'User' : 'Assistant'}: ${m.message.slice(0, 200)}`
        )
        .join('\n');

      const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage(
          'Summarize the following conversation in 2-3 sentences. Focus on the key topics discussed and any important conclusions or code/queries that were shared.'
        ),
        new HumanMessage(conversationText),
      ]);

      const chain = prompt.pipe(model).pipe(new StringOutputParser());
      const summary = await chain.invoke({});
      return summary;
    } catch {
      // Fallback: extract key user messages
      const userMessages = messages
        .filter((m) => m.role === AiChatRole.USER)
        .slice(-3)
        .map((m) => m.message.slice(0, 100))
        .join('; ');
      return `Earlier conversation topics: ${userMessages}`;
    }
  }

  /**
   * Persist user + assistant messages and bump the session timestamp.
   */
  private async saveMessagePair(
    sessionId: string,
    messageInput: SendMessageDto,
    responseContent: string,
    transactionId: string,
    usageMetadata?: { input_tokens?: number; output_tokens?: number }
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.aiChatMessage.create({
        data: {
          sessionId,
          message: messageInput.message,
          role: AiChatRole.USER,
          sdl: messageInput.sdl,
          graphqlQuery: messageInput.graphqlQuery,
          graphqlVariables: messageInput.graphqlVariables,
          transactionId,
        },
      });
      await tx.aiChatMessage.create({
        data: {
          sessionId,
          message: responseContent,
          role: AiChatRole.ASSISTANT,
          inputTokens: usageMetadata?.input_tokens,
          outputTokens: usageMetadata?.output_tokens,
        },
      });
      await tx.aiChatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    });
  }

  private async sendToAI(
    messageInput: SendMessageDto,
    previousMessages: AiChatMessage[]
  ) {
    const chain = this.buildPromptChain(messageInput, previousMessages);

    // Pass variables to invoke (variables are wrapped in curly braces)
    const response = await chain.invoke({});
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

  /**
   * Build the LangChain prompt + model pipeline. Shared by both invoke and stream paths.
   */
  private buildPromptChain(
    messageInput: SendMessageDto,
    previousMessages: AiChatMessage[]
  ) {
    const model = this.getChatModel();

    const promptTemplate = ChatPromptTemplate.fromMessages([
      new SystemMessage({
        content: [
          {
            text: getPrompt(
              messageInput.sdl ?? '',
              messageInput.graphqlQuery ?? '',
              messageInput.graphqlVariables ?? '',
              messageInput.graphqlResponse ?? ''
            ),
            type: 'text',
            cache_control: { type: 'ephemeral' },
          },
        ],
      }),
      ...previousMessages.map((m) => {
        if (m.role === AiChatRole.USER) {
          return new HumanMessage(m.message);
        }
        return new AIMessage(m.message);
      }),
      new HumanMessage(`${messageInput.message}`),
    ]);

    return promptTemplate.pipe(model);
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
          maxTokens: responseMaxTokens,
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
      case 'google': {
        const cfGatewayAccountId = this.configService.get('ai.aiGateway.accountId', {
          infer: true,
        });
        const cfGatewayName = this.configService.get('ai.aiGateway.name', {
          infer: true,
        });
        const baseUrl =
          cfGatewayAccountId && cfGatewayName
            ? `https://gateway.ai.cloudflare.com/v1/${cfGatewayAccountId}/${cfGatewayName}/google-ai-studio`
            : undefined;
        return new ChatGoogleGenerativeAI({
          apiKey: this.configService.get('ai.google.apiKey', { infer: true }),
          model:
            this.configService.get('ai.google.model', { infer: true }) ??
            'gemini-2.5-flash',
          maxOutputTokens: responseMaxTokens,
          baseUrl,
        });
      }
      case 'anthropic':
      default: {
        return new ChatAnthropic({
          apiKey: this.configService.get('ai.anthropic.apiKey', { infer: true }),
          model: this.configService.get('ai.anthropic.model', { infer: true }),
          maxTokens: responseMaxTokens,
          clientOptions: {
            defaultHeaders: {
              'anthropic-beta': 'prompt-caching-2024-07-31',
            },
          },
        });
      }
    }
  }
}
