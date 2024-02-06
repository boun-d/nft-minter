import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
} from '@nestjs/common';
import {
  existsSync,
  mkdirSync,
  readdirSync,
} from 'fs';
import { Observable } from 'rxjs';

export function EnforceEmptyDirectoryInterceptor(path: string): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      } else if (readdirSync(path).length > 0) {
        throw new Error('Image processing in progress...')
      }
      return next.handle();
    }
  }
  const Interceptor = mixin(MixinInterceptor);
  return Interceptor;
}
