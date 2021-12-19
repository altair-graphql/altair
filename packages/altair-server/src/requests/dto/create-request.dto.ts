import { PartialType } from '@nestjs/graphql';
import { Request } from '../entities/request.entity';

export class CreateRequestDto extends PartialType(Request) {}
