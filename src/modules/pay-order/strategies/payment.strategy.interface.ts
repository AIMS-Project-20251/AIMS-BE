import { Order } from '../../place-order/entities/order.entity';

export interface PaymentResponse {
  method: string;
  transactionId?: string;
  paymentUrl?: string;
  qrData?: any;
}

export interface PaymentStrategy {
  createPaymentRequest(order: Order): Promise<PaymentResponse>;
  verifyTransaction(transactionId: string): Promise<boolean>;
  refundTransaction(transactionId: string, amount?: number): Promise<boolean>;
}