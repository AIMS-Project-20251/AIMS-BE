import { IsString, IsEmail, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from 'src/modules/products/entities/base-product.entity';

class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}