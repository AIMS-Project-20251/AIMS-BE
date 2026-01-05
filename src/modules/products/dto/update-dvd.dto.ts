import { IsString, IsNumber, Min, IsOptional, IsObject, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '../entities/base-product.entity';

export enum DiscType {
    BLURAY = 'BLURAY',
    HD_DVD = 'HD_DVD',
  }

export class UpdateDvdDto {
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

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsEnum(DiscType)
  discType: DiscType;

  @ApiProperty()
  @IsString()
  director: string;

  @ApiProperty()
  @IsString()
  runtime: string;

  @ApiProperty()
  @IsString()
  studio: string;

  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty({ type: [String] })
  subtitles: string[];

  @ApiPropertyOptional()
  releaseDate?: Date;

  @ApiPropertyOptional()
  genre?: string;
}
