import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RequestCollectionDocument = RequestCollection & Document;

@Schema({ timestamps: true })
export class RequestCollection {
  id: string;

  @Prop()
  name: string;

  @Prop()
  ownerId: string;

  @Prop()
  workspaceId: string;
}

export const RequestCollectionSchema =
  SchemaFactory.createForClass(RequestCollection);
