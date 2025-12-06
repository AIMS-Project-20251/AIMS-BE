import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min, IsUrl } from 'class-validator';
import { Order } from 'src/modules/place-order/entities/order.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty()
    @IsNumber()
    @Min(1)
    orderId: number
}