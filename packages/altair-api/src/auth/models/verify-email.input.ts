import { IsJWT, IsNotEmpty } from 'class-validator';

export class VerifyEmailInput {
  @IsNotEmpty()
  @IsJWT()
  token!: string;
}
