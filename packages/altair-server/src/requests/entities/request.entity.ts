import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  name: string;

  @Prop()
  url?: string;

  @Prop({ required: true })
  query: string;

  @Prop([{}])
  headers?: { key: string; value: string }[];

  @Prop({ type: {} })
  variables?: any;

  @Prop({ type: Types.ObjectId, ref: 'Workspace' })
  workspace?: Workspace;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
