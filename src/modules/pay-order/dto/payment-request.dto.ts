import { IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentRequestDto {
  @ApiProperty()
  @IsNumber()
  orderId: number;

  @ApiProperty()
  @IsEnum(['PAYPAL', 'VIETQR'])
  method: 'PAYPAL' | 'VIETQR';
}