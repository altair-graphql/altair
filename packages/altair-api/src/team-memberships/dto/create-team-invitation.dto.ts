import { ApiProperty } from '@nestjs/swagger';
import { TeamMemberRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamInvitationDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  role?: TeamMemberRole;
}
