import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { ApiBody } from '@nestjs/swagger';
import { ConfirmVietqrDto } from './dto/confirm-vietqr.dto';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `PayOrderService`, DTOs `PaymentRequestDto`, `ConfirmVietqrDto`
* - Reason: Controller maps HTTP requests to service methods and depends on DTO shapes.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: endpoint handlers for creating payments, confirm/cancel/refund
* - Reason: Controller focuses on exposing payment-related endpoints and delegating to service logic.
* ---------------------------------------------------------
*/
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
        vietQROrderId: { type: 'string', example: "123" },
      },
      required: ['vietQROrderId'],
    },
  })
  @Post('confirm-vietqr')
  confirmVietqr(@Body() body: ConfirmVietqrDto) {
    return this.payOrderService.comfirmVietqrTransaction(body.vietQROrderId);
  }

  
}
