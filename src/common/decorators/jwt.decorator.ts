import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { Roles } from './roles.decorator';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { RolesGuard } from '../guard/roles.guard';
import { JWTPayload, RequestWithUser } from '../interface/jwt.interface';
import { UserRole } from 'prisma/generated/prisma/enums';

// Get user decorator
export const GetUser = createParamDecorator(
  (data: keyof JWTPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

// Auth + role validation
export function ValidateAuth(...roles: UserRole[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];
  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }
  return applyDecorators(...decorators);
}

export const ValidateStudent = () => ValidateAuth(UserRole.STUDENT);
export const ValidateAllUser = () =>
  ValidateAuth(UserRole.STUDENT, UserRole.ADMIN);

export const ValidateAdmin = () => ValidateAuth(UserRole.ADMIN);
