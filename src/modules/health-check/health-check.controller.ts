import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {
  @Get()
  findAll() {
    return { status: 'OK', message: `Server's running great`, timestamp: new Date() };
  }
}
