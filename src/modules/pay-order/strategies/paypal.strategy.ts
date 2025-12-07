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
  private readonly baseUrl: string | undefined;
  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;

  constructor(@InjectRepository(Payment) private paymentRepo: Repository<Payment>) {
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
            brand_name: "AIMS",
            user_action: "PAY_NOW",
            return_url: `http://localhost:${env.port}/api/pay-order/comfirm-paypal`,
            cancel_url: `http://localhost:${env.port}/api/pay-order/cancel-paypal`,
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
      const url = new URL(approveLink.href);
      const transactionId = url.searchParams.get('token') ?? undefined;

      const payment = this.paymentRepo.create({
        method: 'PAYPAL',
        transactionId: transactionId,
        amount: order.totalAmount,
        order: order,
      });

      this.paymentRepo.save(payment);

      return {
        method: 'PAYPAL',
        transactionId: payment.transactionId,
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

  async refundPayment(captureId: string, amountUSD?: string) {
    const accessToken = await this.getAccessToken();

    try {
      const body = amountUSD
        ? { amount: { value: amountUSD, currency_code: "USD" } }
        : {};

      const response = await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (err) {
      console.log(err.response?.data);
      throw new InternalServerErrorException("Failed to refund payment");
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

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Common/Data coupling
* - With which class: `Payment` entity, external PayPal API, `PaymentRepository`
* - Reason: This strategy depends on external PayPal API and persists `Payment` entities via repository; it couples to HTTP/axios interactions and config.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `createPaymentRequest`, `capturePayment`, `refundPayment`, `getAccessToken`
* - Reason: All methods are concerned with PayPal-specific payment lifecycle; the class encapsulates PayPal integration.
* ---------------------------------------------------------
*/