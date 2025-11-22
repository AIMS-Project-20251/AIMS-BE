import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../place-order/entities/order.entity';
import { PaypalStrategy } from './strategies/paypal.strategy';
import { VietqrStrategy } from './strategies/vietqr.strategy';
import { PaymentStrategy, PaymentResponse } from './strategies/payment.strategy.interface';

@Injectable()
export class PayOrderService {
  private readonly strategies: Record<string, PaymentStrategy>;

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private readonly paypalStrategy: PaypalStrategy,
    private readonly vietqrStrategy: VietqrStrategy,
  ) {
    this.strategies = {
      PAYPAL: this.paypalStrategy,
      VIETQR: this.vietqrStrategy,
    };
  }

  async initiatePayment(orderId: number, method: 'PAYPAL' | 'VIETQR' = 'VIETQR'): Promise<PaymentResponse> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const strategy = this.strategies[method];

    if (!strategy) {
      throw new BadRequestException(`Payment method ${method} is not supported`);
    }

    return strategy.createPaymentRequest(order);
  }

  async confirmPaypalTransaction(paypalOrderId: string) {
    const captureData = await this.paypalStrategy.capturePayment(paypalOrderId);

    const myDbId = captureData.purchase_units[0].reference_id; 
    
    const order = await this.orderRepo.findOne({ where: { id: Number(myDbId) } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.APPROVED;
    await this.orderRepo.save(order);

    return { success: true, orderId: order.id };
  }

  comfirmVietqrTransaction() {
  }
}