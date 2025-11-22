import { Controller, Post, Body } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';
import { PaymentRequestDto } from './dto/payment-request.dto';

@Controller('pay-order')
export class PayOrderController {
  constructor(private readonly payOrderService: PayOrderService) {}

  @Post('create')
  create(@Body() dto: PaymentRequestDto) {
    return this.payOrderService.initiatePayment(dto.orderId, dto.method);
  }
}