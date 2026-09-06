import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@cryptovision/shared-types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorMessage =
      typeof message === 'object' && (message as any).message
        ? Array.isArray((message as any).message)
          ? (message as any).message.join(', ')
          : (message as any).message
        : (exception as any)?.message || 'An unexpected error occurred';

    const errorCode =
      typeof message === 'object' && (message as any).error
        ? (message as any).error
        : 'INTERNAL_ERROR';

    this.logger.error(`[${status}] ${errorMessage}`, (exception as any)?.stack);

    const errorEnvelope: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: errorCode,
        message: errorMessage,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorEnvelope);
  }
}
