import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestCollection } from 'src/request-collections/entities/request-collection.entity';
import { User } from 'src/users/entities/user.entity';

export type WorkspaceDocument = Workspace & Document;
@Schema({ timestamps: true })
export class Workspace {
  id: string;

  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: User; // owned by account (user, team, organization)

  @Prop({ type: [{ type: Types.ObjectId, ref: 'RequestCollection' }] })
  collections: RequestCollection[];

  @Prop()
  private?: boolean;

  // contains query collections
  // collections:

  // Roles
  // https://stackoverflow.com/a/57083784/3929126
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
