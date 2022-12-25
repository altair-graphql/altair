import {
  BaseDocument,
  BaseOwnableDocument
} from "altair-graphql-core/build/types/shared";
import { TEAM_ROLES } from "./constants";

type TeamRole = typeof TEAM_ROLES[keyof typeof TEAM_ROLES];

export interface UserDocument extends BaseDocument {
  name: string;
  email: string;
}

export interface TeamMembership extends BaseOwnableDocument {
  teamUid: string;
  role: TeamRole;
}
