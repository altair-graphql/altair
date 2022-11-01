import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenInput {
  @IsNotEmpty()
  @IsJWT()
  token: string;
}
