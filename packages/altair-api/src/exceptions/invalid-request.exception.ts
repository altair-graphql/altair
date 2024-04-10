import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ERRORS } from 'src/common/errors';

export class InvalidRequestException extends HttpException {
  constructor(errCode: ErrorCode, message?: string) {
    let msg = ERRORS[errCode];
    if (msg && message) {
      msg += `: ${message}`;
    }
    if (!msg) {
      msg = message ?? 'Bad request';
    }

    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: errCode,
          message: msg,
        },
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
