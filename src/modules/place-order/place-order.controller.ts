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