import { User as UserEntity } from '@prisma/client';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends UserEntity {}
    // export type User = UserEntity;
    export interface Request {
      user?: UserEntity;
    }
  }
}
