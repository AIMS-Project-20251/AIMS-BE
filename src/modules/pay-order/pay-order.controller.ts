import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { ApiBody } from '@nestjs/swagger';
import { ConfirmVietqrDto } from './dto/confirm-vietqr.dto';

@Controller('pay-order')
export class PayOrderController {
  constructor(private readonly payOrderService: PayOrderService) {}

  @Post('create')
  create(@Body() dto: PaymentRequestDto) {
    return this.payOrderService.initiatePayment(dto.orderId, dto.method);
  }

  @Get('confirm-paypal')
  confirmPaypal(@Query('token') token: string) {
    return this.payOrderService.confirmTransaction(token, 'PAYPAL');
  }

  @Post('confirm-vietqr')
  confirmVietqr(@Body() body: ConfirmVietqrDto) {
    return this.payOrderService.confirmTransaction(
      body.vietQROrderId,
      'VIETQR',
    );
  }

  @Get('cancel-paypal')
  cancelPaypal(@Query('token') token: string) {
    return this.payOrderService.cancelTransaction(token);
  }

  @Post('refund')
  refundTransaction(
    @Body('transactionId') transactionId: string,
    @Body('amount') amount?: number,
  ) {
    return this.payOrderService.refund(transactionId, amount);
  }
}
