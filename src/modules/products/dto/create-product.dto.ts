import { IsString, IsNumber, Min, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductType {
  BOOK = 'BOOK',
  CD = 'CD',
  DVD = 'DVD',
  NEWSPAPER = 'NEWSPAPER',
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  originalValue: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  currentPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiPropertyOptional({ type: Object, description: 'Loại này chứa các thuộc tính đặc thù của sản phẩm theo type' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}
