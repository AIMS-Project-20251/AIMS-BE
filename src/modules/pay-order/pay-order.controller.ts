import { Controller, Post, Body } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('pay-order')
export class PayOrderController {
  constructor(private readonly payOrderService: PayOrderService) {}

  @Post('create')
  create(@Body() dto: PaymentRequestDto) {
    console.log('Payment Request DTO:', dto);
    return this.payOrderService.initiatePayment(dto.orderId, dto.method);
  }

  @Post('confirm-paypal')
  confirmPaypal(@Body('paypalOrderId') paypalOrderId: string) {
    return this.payOrderService.confirmPaypalTransaction(paypalOrderId);
  }

  @Post('confirm-vietqr')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        vietQROrderId: { type: 'number', example: 123 },
      },
      required: ['vietQROrderId'],
    },
  })
  confirmVietqr(@Body('vietQROrderId') vietQROrderId: string) {
    return this.payOrderService.comfirmVietqrTransaction(vietQROrderId);
  }
}