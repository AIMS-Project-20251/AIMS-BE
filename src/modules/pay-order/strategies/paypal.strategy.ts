import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PaymentStrategy, PaymentResponse } from './payment.strategy.interface';
import { Order } from '../../place-order/entities/order.entity';
import { env } from 'src/config';
import { Payment } from '../entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaypalStrategy implements PaymentStrategy {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {
    this.baseUrl = env.paypal.url || '';
    this.clientId = env.paypal.clientId || '';
    this.clientSecret = env.paypal.clientSecret || '';
  }

  async createPaymentRequest(order: Order): Promise<PaymentResponse> {
    const accessToken = await this.getAccessToken();
    const amountUSD = (order.totalAmount / 24000).toFixed(2);

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: order.id.toString(),
              amount: { currency_code: 'USD', value: amountUSD },
            },
          ],
          application_context: {
            brand_name: 'AIMS',
            user_action: 'PAY_NOW',
            return_url: `${env.fe_url}/order-success`,
            cancel_url: `${env.fe_url}/order-fail`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const approveLink = response.data.links.find(
        (link: any) => link.rel === 'approve',
      );
      const url = new URL(approveLink.href);
      const transactionId = url.searchParams.get('token');

      if (!transactionId) {
        throw new InternalServerErrorException(
          'Failed to extract transaction ID from PayPal response',
        );
      }

      const payment = this.paymentRepo.create({
        method: 'PAYPAL',
        transactionId: transactionId,
        amount: order.totalAmount,
        order: order,
        status: 'PENDING',
      });
      await this.paymentRepo.save(payment);

      return {
        method: 'PAYPAL',
        transactionId: transactionId,
        paymentUrl: approveLink.href,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create PayPal order');
    }
  }

  async verifyTransaction(transactionId: string): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${transactionId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.status === 'COMPLETED';
    } catch (error) {
      // Nếu lỗi do đã capture rồi thì check lại status
      console.error('Verify transaction error', error.message);
      return false;
    }
  }

  async refundTransaction(
    captureId: string,
    amount?: number,
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    try {
      const body = amount
        ? { amount: { value: amount.toString(), currency_code: 'USD' } }
        : {};
      await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return true;
    } catch (err) {
      console.error(err.response?.data);
      throw new InternalServerErrorException('Failed to refund payment');
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );
    const response = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data.access_token;
  }
}
