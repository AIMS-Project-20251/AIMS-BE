import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PlaceOrderService } from './place-order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('place-order')
export class PlaceOrderController {
  constructor(private readonly placeOrderService: PlaceOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async placeOrder(@Body() dto: CreateOrderDto) {
    return this.placeOrderService.placeOrder(dto);
  }

  @Post('calculate-fee')
  @HttpCode(HttpStatus.OK)
  async calculateFee(@Body() dto: CreateOrderDto) {
    return this.placeOrderService.calculateFeesOnly(dto);
  }
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `PlaceOrderService`, DTO `CreateOrderDto`
* - Reason: Controller forwards incoming DTOs to the service and relies on service responses; it depends on DTO shapes and service interface.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `placeOrder`, `calculateFee` methods
* - Reason: Controller's responsibilities are limited to request handling and delegating to the service; methods are tightly focused on HTTP endpoints.
* ---------------------------------------------------------
*/