import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../place-order/entities/order.entity';
import { PaypalStrategy } from './strategies/paypal.strategy';
import { VietqrStrategy } from './strategies/vietqr.strategy';
import { PaymentStrategy, PaymentResponse } from './strategies/payment.strategy.interface';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class PayOrderService {
  private readonly strategies: Record<string, PaymentStrategy>;

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private readonly paypalStrategy: PaypalStrategy,
    private readonly vietqrStrategy: VietqrStrategy,
  ) {
    this.strategies = {
      PAYPAL: this.paypalStrategy,
      VIETQR: this.vietqrStrategy,
    };
  }

  async initiatePayment(orderId: number, method: 'PAYPAL' | 'VIETQR' = 'VIETQR'): Promise<PaymentResponse> {
    const order = await this.orderRepo.findOne({ where: { id: orderId, status: OrderStatus.PENDING }, relations: ['items', 'items.product'] });
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

    const invoice = this.invoiceRepo.create({
      order: order,
      totalAmount: order.totalAmount,
      paymentMethod: 'PAYPAL',
      transactionId: captureData.id,
    });
    await this.invoiceRepo.save(invoice);

    return { success: true, orderId: order.id };
  }

  async comfirmVietqrTransaction(vietQROrderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: Number(vietQROrderId) } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.APPROVED;
    await this.orderRepo.save(order);

    const fakeBankTransId = `VQR-${Date.now()}`; 

    const invoice = this.invoiceRepo.create({
      order: order,
      totalAmount: order.totalAmount,
      paymentMethod: 'VIETQR',
      transactionId: fakeBankTransId, 
    });
    await this.invoiceRepo.save(invoice);

    return { success: true, orderId: order.id };
  }
}