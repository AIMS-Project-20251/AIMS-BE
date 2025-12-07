import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Uncoupled
* - With which class: `HealthCheckController`
* - Reason: Module simply registers the controller; minimal dependencies.
*
* 2. COHESION:
* - Level: Procedural cohesion
* - Between components: module registration
* - Reason: Focused on wiring the health-check controller into the app.
* ---------------------------------------------------------
*/
@Module({
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}

