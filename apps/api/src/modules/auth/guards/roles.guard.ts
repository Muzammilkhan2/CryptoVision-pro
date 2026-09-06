import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@cryptovision/shared-types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    // Role hierarchy: ADMIN > PREMIUM > USER
    const roleHierarchy: Record<UserRole, number> = {
      ADMIN: 3,
      PREMIUM: 2,
      USER: 1,
    };

    const userLevel = roleHierarchy[user.role as UserRole] || 1;
    const hasPermission = requiredRoles.some(
      (role) => userLevel >= (roleHierarchy[role] || 1),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Requires role in [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
}
