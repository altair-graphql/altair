import { User } from './users/entities/user.entity';
import { Request } from 'express';

export interface IRequest extends Request {
  user?: User;
}
