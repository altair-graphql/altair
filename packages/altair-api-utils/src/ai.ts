export interface ISendMessageDto {
  message: string;
  sdl?: string;
  graphqlQuery?: string;
  graphqlVariables?: string;
}

export interface IRateMessageDto {
  rating: number;
}
