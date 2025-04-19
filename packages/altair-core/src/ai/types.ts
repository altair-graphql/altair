export interface ISession {
  id: string;
  userId: string;
  title: string;
  isActive: boolean;
}

export interface IMessage {
  id: string;
  sessionId: string;
  message: string;
  role: 'USER' | 'ASSISTANT';
}

export interface ISendMessageDto {
  message: string;
  sdl?: string;
  graphqlQuery?: string;
  graphqlVariables?: string;
  graphqlResponse?: string;
}

export interface IRateMessageDto {
  rating: number;
}
