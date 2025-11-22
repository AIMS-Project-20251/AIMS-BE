import { IsEnum, IsNumber } from 'class-validator';

export class PaymentRequestDto {
  @IsNumber()
  orderId: number;

  @IsEnum(['PAYPAL', 'VIETQR'])
  method: 'PAYPAL' | 'VIETQR';
}