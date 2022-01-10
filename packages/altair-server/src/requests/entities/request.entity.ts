import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { IQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  name: string;

  @Prop({ type: {} })
  content: IQuery;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
