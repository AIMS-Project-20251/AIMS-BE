import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ProductType } from '../entities/product.entity';

export class UpdateProductDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalValue?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPrice?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string | null;

  @ApiPropertyOptional({ nullable: true, enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any> | null;
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `Product` entity, controller/service that consume it
* - Reason: DTO mirrors a subset of product properties and is used to transfer update data to the service.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: optional properties for updating a product
* - Reason: DTO serves one responsibility (partial product updates) and its properties are cohesive for that role.
* ---------------------------------------------------------
*/