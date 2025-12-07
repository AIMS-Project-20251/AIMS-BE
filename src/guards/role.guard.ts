import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `Reflector`, Http request objects
* - Reason: Uses metadata from `Reflector` and reads `request.user` to decide access. It relies on role values but does not manipulate other modules' internals.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `canActivate` method
* - Reason: Single responsibility: enforce role-based access checks. The class contains only the logic necessary for that purpose.
* ---------------------------------------------------------
*/
