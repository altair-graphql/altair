export {
  ISendMessageDto,
  IRateMessageDto,
} from 'altair-graphql-core/build/ai/types';

export interface AiStreamEvent {
  type: 'chunk' | 'done' | 'error';
  content: string;
}
