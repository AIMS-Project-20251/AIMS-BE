import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../place-order/entities/order.entity';
import { PaypalStrategy } from './strategies/paypal.strategy';
import { VietqrStrategy } from './strategies/vietqr.strategy';
import {
  PaymentStrategy,
  PaymentResponse,
} from './strategies/payment.strategy.interface';
import { MailSenderService } from '../mail-sender/mail-sender.service';
import { ProductsStrategy } from '../products/strategies/products.strategy.interface';
import { BooksStrategy } from '../products/strategies/books.strategy';
import { CdsStrategy } from '../products/strategies/cds.strategy';
import { DvdsStrategy } from '../products/strategies/dvds.strategy';
import { NewspapersStrategy } from '../products/strategies/newspapers.strategy';
import { Payment } from './entities/payment.entity';
import { PRODUCT_STRATEGIES } from '../products/constants/product-strategies.token';
import { ProductType } from '../products/entities/base-product.entity';

@Injectable()
export class PayOrderService {
  private readonly paymentStrategies: Record<string, PaymentStrategy>;

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @Inject(PRODUCT_STRATEGIES)
    private readonly productsStrategies: Record<ProductType, ProductsStrategy>,
    private readonly paypalStrategy: PaypalStrategy,
    private readonly vietqrStrategy: VietqrStrategy,
    private readonly mailSenderService: MailSenderService,
  ) {
    this.paymentStrategies = {
      PAYPAL: this.paypalStrategy,
      VIETQR: this.vietqrStrategy,
    };
  }

  async initiatePayment(orderId: number, method: 'PAYPAL' | 'VIETQR' = 'VIETQR'): Promise<PaymentResponse> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, status: OrderStatus.CREATED },
      relations: ['items'],
    });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
  
    for (const item of order.items) {
      let product;
      const strategy = this.productsStrategies[item.productType];
      if (!strategy) {
        throw new BadRequestException(
          `Product type ${item.productType} is not supported`,
        );
      }
      product = await strategy.findOne(item.productId);
      item['product'] = product;
    }
  
    const strategy = this.paymentStrategies[method];
    if (!strategy) {
      throw new BadRequestException(
        `Payment method ${method} is not supported`,
      );
    }
  
    return strategy.createPaymentRequest(order);
  }
  

  // async confirmPaypalTransaction(paypalOrderId: string) {
  //   const captureData = await this.paypalStrategy.capturePayment(paypalOrderId);
  //   const myDbId = captureData.purchase_units[0].reference_id;

  //   const order = await this.orderRepo.findOne({ where: { id: Number(myDbId) } });
  //   if (!order) throw new NotFoundException('Order not found');

  //   order.status = OrderStatus.PAID;
  //   await this.orderRepo.save(order);

  //   const invoice = this.invoiceRepo.create({
  //     order: order,
  //     totalAmount: order.totalAmount,
  //     paymentMethod: 'PAYPAL',
  //     transactionId: captureData.id,
  //   });
  //   await this.invoiceRepo.save(invoice);

  //   return { success: true, orderId: order.id };
  // }

  async confirmPaypalTransaction(paypalOrderId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId: paypalOrderId, method: 'PAYPAL' },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'COMPLETED';
    await this.paymentRepo.save(payment);

    const order = payment.order;
    order.status = OrderStatus.PAID;
    
    await this.orderRepo.save(order);

    this.mailSenderService.sendOrderSuccessEmail(order.id);
  }

  async cancelPaypalTransaction(paypalOrderId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId: paypalOrderId, method: 'PAYPAL' },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'CANCELLED';
    await this.paymentRepo.save(payment);
  }

  // async comfirmVietqrTransaction(vietQROrderId: string) {
  //   const order = await this.orderRepo.findOne({ where: { id: Number(vietQROrderId) } });
  //   if (!order) throw new NotFoundException('Order not found');

  //   order.status = OrderStatus.PAID;
  //   await this.orderRepo.save(order);

  //   const fakeBankTransId = `VQR-${Date.now()}`;

  //   // const invoice = this.invoiceRepo.create({
  //   //   order: order,
  //   //   totalAmount: order.totalAmount,
  //   //   paymentMethod: 'VIETQR',
  //   //   transactionId: fakeBankTransId,
  //   // });
  //   await this.invoiceRepo.save(invoice);

  //   return { success: true, orderId: order.id };
  // }

  async comfirmVietqrTransaction(vietQROrderId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId: vietQROrderId, method: 'VIETQR' },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'COMPLETED';
    await this.paymentRepo.save(payment);

    const order = payment.order;
    order.status = OrderStatus.PAID;
    
    await this.orderRepo.save(order);

    this.mailSenderService.sendOrderSuccessEmail(order.id);

    return { success: true };
  }

  async refund(captureId: string, amountUSD?: string) {
    return this.paypalStrategy.refundPayment(captureId, amountUSD);
  }
}
