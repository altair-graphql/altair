import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  id: string;

  @Prop({ required: true, minlength: 2 })
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  auth0Id: string;

  @Prop({ type: Types.ObjectId, ref: 'Workspace' })
  privateWorkspace: Workspace;
}

export const UserSchema = SchemaFactory.createForClass(User);
