import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStrategy, PaymentResponse } from './payment.strategy.interface';
import { Order } from '../../place-order/entities/order.entity';

@Injectable()
export class VietqrStrategy implements PaymentStrategy {
  constructor(private configService: ConfigService) {}

  async createPaymentRequest(order: Order): Promise<PaymentResponse> {
    return {
      method: 'VIETQR',
    };
  }
}