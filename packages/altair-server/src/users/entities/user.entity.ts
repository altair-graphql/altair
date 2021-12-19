import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  passwordHash: string;

  @Prop()
  saltRounds: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
