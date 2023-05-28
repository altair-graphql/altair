import { ICreateTeamMembershipDto } from '@altairgraphql/api-utils';
import { TeamMemberRole } from '@altairgraphql/db';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamMembershipDto implements ICreateTeamMembershipDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  teamId!: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  role?: TeamMemberRole;
}
