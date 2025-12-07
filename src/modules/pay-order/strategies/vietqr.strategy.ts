import { Injectable } from '@nestjs/common';
import { PaymentStrategy, PaymentResponse } from './payment.strategy.interface';
import { Order } from '../../place-order/entities/order.entity';
import axios from 'axios';
import { Payment } from '../entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VietqrStrategy implements PaymentStrategy {
  private vietqrUrl: string | undefined;
  private clientId: string | undefined;
  private apiKey: string | undefined;
  private accountNumber: string | undefined;
  private bankName: string | undefined;
  private acqId: string | undefined;

  constructor(@InjectRepository(Payment) private paymentRepo: Repository<Payment>) {
    this.vietqrUrl = process.env.VIETQR_URL;
    this.clientId = process.env.VIETQR_CLIENT_ID;
    this.apiKey = process.env.VIETQR_API_KEY;
    this.accountNumber = process.env.BANK_ACCOUNT_NO;
    this.bankName = process.env.BANK_ACCOUNT_NAME;
    this.acqId = process.env.BANK_BIN;
  }

  async createPaymentRequest(order: Order): Promise<PaymentResponse> {
    try {
      const fakeBankTransId = `VQR-${Date.now()}`;

      const itemDetails = order.items
      .map((item) => `#${item.productId}`)
      .join(', ');

      const payload = {
        accountNo: this.accountNumber,
        accountName: this.bankName,
        acqId: this.acqId,
        amount: order.totalAmount,
        addInfo: `Payment for order #${order.id}: ${itemDetails}`,
        format: 'text',
        template: 'compact'
      }

      const response = await axios.post(this.vietqrUrl!, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.clientId!,
          'x-api-key': this.apiKey!,
        }})

      const payment = this.paymentRepo.create({ 
        method: 'VIETQR',
        amount: order.totalAmount,
        order: order,
        transactionId: fakeBankTransId
      });

      this.paymentRepo.save(payment);

      return {
        method: 'VIETQR',
        transactionId: payment.transactionId,
        qrData: response.data.data.qrDataURL,
      };
    } catch (error) {
      throw new Error(`Failed to create VietQR payment request: ${error.message}`);
    }
  }
}