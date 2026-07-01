// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // Add this
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorators/response-message';
// import { RESPONSE_MESSAGE } from '../decorator/response-message.decorator';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private reflector: Reflector) {} // Inject Reflector

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    // 1. Get custom message from decorator
    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((result) => {
        let message = customMessage || 'Request successful';
        let data = result;

        // 2. Handle cases where the controller returns an object with its own message
        if (result && typeof result === 'object' && 'message' in result) {
          message = result.message;
          data = result.data !== undefined ? result.data : result;
          // Remove the message field from data if it exists so it's not duplicated
          if (data.message) delete data.message;
        }

        // 3. Dynamic Fallback logic if no custom message is provided
        if (!customMessage && !result?.message) {
          const status = response.statusCode;
          if (status === HttpStatus.CREATED)
            message = 'Resource created successfully';
          if (status === HttpStatus.OK)
            message = 'Request processed successfully';
          if (status === HttpStatus.NO_CONTENT)
            message = 'Resource deleted successfully';
        }

        return {
          statusCode: response.statusCode,
          success: response.statusCode >= 200 && response.statusCode < 300,
          message: message,
          data: data ?? null,
        };
      }),
    );
  }
}
//
