import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ERRORS } from 'src/common/errors';

export class InvalidRequestException extends HttpException {
  constructor(errCode: ErrorCode, message?: string) {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: errCode,
          message: ERRORS[errCode] ?? message ?? 'Bad request',
        },
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
