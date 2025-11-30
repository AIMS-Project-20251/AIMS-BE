import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('pay-order')
export class PayOrderController {
  constructor(private readonly payOrderService: PayOrderService) { }

  @Post('create')
  create(@Body() dto: PaymentRequestDto) {
    console.log('Payment Request DTO:', dto);
    return this.payOrderService.initiatePayment(dto.orderId, dto.method);
  }

  @Get('confirm-paypal')
  confirmPaypal(@Query('token') token: string) {
    return this.payOrderService.confirmPaypalTransaction(token);
  }

  @Get('cancel-paypal')
  cancelPaypal(@Query('token') token: string) {
    return this.payOrderService.cancelPaypalTransaction(token);
  }

  @Post('refund-paypal')
  refundPaypal(
    @Body('captureId') captureId: string,
    @Body('amountUSD') amountUSD?: string,
  ) {
    return this.payOrderService.refund(captureId, amountUSD);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        vietQROrderId: { type: 'number', example: 123 },
      },
      required: ['vietQROrderId'],
    },
  })
  @Post('confirm-vietqr')
  confirmVietqr(@Query('token') token: string) {
    return this.payOrderService.comfirmVietqrTransaction(token);
  }
}