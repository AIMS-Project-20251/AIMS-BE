import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `PayOrderController`, `PayOrderService`
* - Reason: DTO carries a single identifier used to confirm a VietQR payment and is consumed by controller/service.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `vietQROrderId`
* - Reason: Single-purpose DTO that contains only the data necessary for VietQR confirmation.
* ---------------------------------------------------------
*/
export class ConfirmVietqrDto {
  @IsString()
  @IsNotEmpty()
  vietQROrderId: string;
}

