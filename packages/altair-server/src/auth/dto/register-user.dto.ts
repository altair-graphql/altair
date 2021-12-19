import { User } from 'src/users/entities/user.entity';

export type RegisterUserDto = Partial<User> & { password: string };
