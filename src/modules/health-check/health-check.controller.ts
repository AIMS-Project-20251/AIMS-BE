import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {
  @Get()
  findAll() {
    return { status: 'OK', message: `Server's running great`, timestamp: new Date() };
  }
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Uncoupled / Data coupling
* - With which class: none
* - Reason: Simple controller that returns server health; it does not rely on other services or repositories.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `findAll` method
* - Reason: Single-purpose endpoint returning health status; class is narrowly focused.
* ---------------------------------------------------------
*/
