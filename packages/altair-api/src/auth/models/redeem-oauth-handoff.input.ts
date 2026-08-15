import { IsNotEmpty, IsString } from 'class-validator';

export class RedeemOAuthHandoffInput {
  @IsString()
  @IsNotEmpty()
  handoffCode!: string;

  @IsString()
  @IsNotEmpty()
  codeVerifier!: string;
}
