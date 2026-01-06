import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../place-order/entities/order.entity';
import { Payment } from './entities/payment.entity';
import { PaymentResponse } from './strategies/payment.strategy.interface';
import { MailSenderService } from '../mail-sender/mail-sender.service';
import { PRODUCT_STRATEGIES } from '../products/constants/product-strategies.token';
import { ProductsStrategy } from '../products/strategies/products.strategy.interface';
import { ProductType } from '../products/entities/base-product.entity';
import { PaymentStrategyFactory } from './strategies/payment.strategy.factory';

@Injectable()
export class PayOrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @Inject(PRODUCT_STRATEGIES)
    private readonly productsStrategies: Record<ProductType, ProductsStrategy>,
    private readonly paymentStrategyFactory: PaymentStrategyFactory,
    private readonly mailSenderService: MailSenderService,
  ) {}

  async initiatePayment(
    orderId: number,
    method: string = 'VIETQR',
  ): Promise<PaymentResponse> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, status: OrderStatus.CREATED },
      relations: ['items'],
    });
    if (!order) {
      throw new BadRequestException('Order not found or already paid');
    }

    for (const item of order.items) {
      const strategy = this.productsStrategies[item.productType];
      if (!strategy) {
        throw new BadRequestException(
          `Product type ${item.productType} is not supported`,
        );
      }
      item['product'] = await strategy.findOne(item.productId);
    }

    const strategy = this.paymentStrategyFactory.getStrategy(method);
    return strategy.createPaymentRequest(order);
  }

  async confirmTransaction(transactionId: string, method?: string) {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId: transactionId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found');
    }

    if (payment.status === 'COMPLETED') {
      return { success: true, message: 'Transaction already completed' };
    }

    const paymentMethod = payment.method;

    const strategy = this.paymentStrategyFactory.getStrategy(paymentMethod);

    try {
      const isVerified = await strategy.verifyTransaction(transactionId);

      if (isVerified) {
        payment.status = 'COMPLETED';
        await this.paymentRepo.save(payment);

        const order = payment.order;
        order.status = OrderStatus.PAID;
        await this.orderRepo.save(order);

        await this.mailSenderService.sendOrderSuccessEmail(order.id);

        return { success: true };
      } else {
        throw new BadRequestException('Transaction verification failed');
      }
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Could not verify transaction');
    }
  }

  async cancelTransaction(transactionId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId: transactionId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'CANCELLED';
    await this.paymentRepo.save(payment);
    return { success: true };
  }

  async refund(transactionId: string, amount?: number) {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const strategy = this.paymentStrategyFactory.getStrategy(payment.method);

    return strategy.refundTransaction(transactionId, amount);
  }
}
