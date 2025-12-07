import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `JwtService`, Http request objects
* - Reason: The guard depends on data provided by incoming requests (authorization header) and delegates token verification to `JwtService`. It uses the token payload to populate `request.user` but does not tightly depend on internal implementation of other modules.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `canActivate` method
* - Reason: The class has a single well-defined responsibility: authenticate requests by verifying JWT. All methods and properties contribute directly to that purpose.
* ---------------------------------------------------------
*/
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {secret: process.env.JWT_SECRET});
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
