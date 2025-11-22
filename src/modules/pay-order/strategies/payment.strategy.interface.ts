import { Order } from '../../place-order/entities/order.entity';

export interface PaymentResponse {
  method: 'PAYPAL' | 'VIETQR';
  paymentUrl?: string;
  qrData?: any;
}

export interface PaymentStrategy {
  createPaymentRequest(order: Order): Promise<PaymentResponse>;
}