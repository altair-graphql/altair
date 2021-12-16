import { Maybe } from 'src/types/types';

export class CreateUserDto {
  firstName: string;
  lastName?: Maybe<string>;
  email: string;
}
