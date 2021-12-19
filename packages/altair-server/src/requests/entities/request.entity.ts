import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
  @Prop()
  name: string;

  @Prop()
  url: string;

  @Prop()
  query: string;

  @Prop([{}])
  headers: { key: string; value: string }[];

  @Prop({ type: {} })
  variables: any;

  @Prop()
  collectionId?: string;

  @Prop()
  ownerId: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
