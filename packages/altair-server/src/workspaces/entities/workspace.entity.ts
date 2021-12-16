import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Workspace {
  @Prop()
  ownerId: string; // owned by account (user, team, organization)

  @Prop()
  name: string;

  // contains query collections
  // collections:

  // Roles
  // https://stackoverflow.com/a/57083784/3929126
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
