import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PaymentStrategy, PaymentResponse } from './payment.strategy.interface';
import { Order } from '../../place-order/entities/order.entity';
import { env } from 'src/config';

@Injectable()
export class PaypalStrategy implements PaymentStrategy {
  private readonly baseUrl: string | undefined;
  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;

  constructor() {
    this.baseUrl = env.paypal.url;
    this.clientId = env.paypal.clientId;
    this.clientSecret = env.paypal.clientSecret;
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
              amount: {
                currency_code: 'USD',
                value: amountUSD,
              },
            },
          ],
          application_context: {
            return_url: `http://localhost:3000/pay-order/success`,
            cancel_url: `http://localhost:3000/pay-order/cancel`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const approveLink = response.data.links.find((link: any) => link.rel === 'approve');

      return {
        method: 'PAYPAL',
        paymentUrl: approveLink.href,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create PayPal order');
    }
  }

  async capturePayment(paypalOrderId: string) {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      if (response.data.status === 'COMPLETED') {
        return response.data;
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to capture PayPal payment');
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
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