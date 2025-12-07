import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
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

  @Get('check-status/:id')
  @HttpCode(HttpStatus.OK)
  async checkStatus(@Param('id') orderId: number) {
    return this.placeOrderService.checkStatus(orderId);
  }
}