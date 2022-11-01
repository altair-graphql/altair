import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordInput {
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
