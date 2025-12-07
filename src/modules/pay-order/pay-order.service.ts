import {
  BadRequestException,
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
import { Payment } from './entities/payment.entity';
import { MailSenderService } from '../mail-sender/mail-sender.service';
import { Book } from '../products/entities/book.entity';
import { CD } from '../products/entities/cd.entity';
import { DVD } from '../products/entities/dvd.entity';
import { Newspaper } from '../products/entities/newspaper.entity';

@Injectable()
export class PayOrderService {
  private readonly strategies: Record<string, PaymentStrategy>;

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Payment) private paymnetRepo: Repository<Payment>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(CD) private cdRepo: Repository<CD>,
    @InjectRepository(DVD) private dvdRepo: Repository<DVD>,
    @InjectRepository(Newspaper) private newspaperRepo: Repository<Newspaper>,
    private readonly paypalStrategy: PaypalStrategy,
    private readonly vietqrStrategy: VietqrStrategy,
    private readonly mailSenderService: MailSenderService,
  ) {
    this.strategies = {
      PAYPAL: this.paypalStrategy,
      VIETQR: this.vietqrStrategy,
    };
  }

  async initiatePayment(
    orderId: number,
    method: 'PAYPAL' | 'VIETQR' = 'VIETQR',
  ): Promise<PaymentResponse> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, status: OrderStatus.CREATED },
      relations: ['items', 'items.product'],
    });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
  
    for (const item of order.items) {
      let product;
      switch (item.productType) {
        case 'BOOK':
          product = await this.bookRepo.findOne({ where: { id: item.productId } });
          break;
        case 'CD':
          product = await this.cdRepo.findOne({ where: { id: item.productId } });
          break;
        case 'DVD':
          product = await this.dvdRepo.findOne({ where: { id: item.productId } });
          break;
        case 'NEWSPAPER':
          product = await this.newspaperRepo.findOne({ where: { id: item.productId } });
          break;
      }
      item['product'] = product;
    }
  
    const strategy = this.strategies[method];
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
    const payment = await this.paymnetRepo.findOne({
      where: { transactionId: paypalOrderId, method: 'PAYPAL' },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'COMPLETED';
    await this.paymnetRepo.save(payment);

    const order = payment.order;
    order.status = OrderStatus.PAID;
    
    await this.orderRepo.save(order);

    this.mailSenderService.sendOrderSuccessEmail(order.id);
  }

  async cancelPaypalTransaction(paypalOrderId: string) {
    const payment = await this.paymnetRepo.findOne({
      where: { transactionId: paypalOrderId, method: 'PAYPAL' },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'CANCELLED';
    await this.paymnetRepo.save(payment);
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
    const payment = await this.paymnetRepo.findOne({
      where: { transactionId: vietQROrderId, method: 'VIETQR' },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'COMPLETED';
    await this.paymnetRepo.save(payment);

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
