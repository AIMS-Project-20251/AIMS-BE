import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min, IsUrl } from 'class-validator';
import { ProductType } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  originalValue: number;

  @IsNumber()
  @Min(0)
  currentPrice: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsUrl()
  imageUrl: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}