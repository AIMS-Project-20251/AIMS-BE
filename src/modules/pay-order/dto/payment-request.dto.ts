import { IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `PayOrderController`, `PayOrderService`
* - Reason: DTO defines the payload expected by the payment creation endpoint and is consumed by controller/service.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `orderId`, `method`
* - Reason: The DTO encapsulates the exact data required to request a payment and nothing else.
* ---------------------------------------------------------
*/
export class PaymentRequestDto {
  @ApiProperty()
  @IsNumber()
  orderId: number;

  @ApiProperty()
  @IsEnum(['PAYPAL', 'VIETQR'])
  method: 'PAYPAL' | 'VIETQR';
}
