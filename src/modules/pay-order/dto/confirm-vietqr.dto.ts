import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfirmVietqrDto {
  @IsString()
  @IsNotEmpty()
  vietQROrderId: string;
}
