import { IsString, IsEmail, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `PlaceOrderController`, `PlaceOrderService`, `OrderItemDto`, `Product` entity (implicitly)
* - Reason: DTO defines the shape of data passed from controller to service and maps closely to order-related entities; it couples to consumers that expect this exact payload shape.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: DTO properties (`customerName`, `email`, `phone`, `shippingAddress`, `city`, `items`)
* - Reason: All properties collectively represent the input required to create an order; the class has a single, focused responsibility as a data transfer object.
* ---------------------------------------------------------
*/
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
