import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Request } from 'src/requests/entities/request.entity';
import { User } from 'src/users/entities/user.entity';

export type RequestCollectionDocument = RequestCollection & Document;

@Schema({ timestamps: true })
export class RequestCollection {
  @Prop({ required: 'Collection name must be specified' })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Request' }] })
  requests: Request[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;
}

export const RequestCollectionSchema =
  SchemaFactory.createForClass(RequestCollection);
