import { CreateRequestDto } from './create-request.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  id: number;
}
