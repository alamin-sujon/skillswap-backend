// src/common/filter/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import AppError from './app-error';
import { Prisma } from 'prisma/generated/prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // 1. Check for your custom AppError
    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
    }
    // 2. Check for NestJS built-in HttpExceptions (e.g., UnauthorizedException)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' ? (res as any).message : res;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        // Duplicate field error
        status = HttpStatus.CONFLICT;
        message = `Duplicate value for field: ${exception.meta?.target}`;
      } else if (exception.code === 'P2025') {
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      }
    }
    // 3. Fallback for unknown errors (Prisma errors, syntax errors, etc.)
    else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
      stack:
        process.env.NODE_ENV === 'development' ? exception.stack : undefined,
    });
  }
}
