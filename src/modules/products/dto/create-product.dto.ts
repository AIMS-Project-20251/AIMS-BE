import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min, IsUrl } from 'class-validator';
import { ProductType } from '../entities/product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsUrl()
  imageUrl: string;

  @ApiProperty()
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `Product` entity, controller/service that consume it
* - Reason: DTO defines the shape of data exchanged between client and server and maps closely to the product entity.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: all DTO properties (title, category, prices, etc.)
* - Reason: All fields together represent the input needed to create a product; the DTO is focused on that single purpose.
* ---------------------------------------------------------
*/