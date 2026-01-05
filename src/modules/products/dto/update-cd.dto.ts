import { IsString, IsNumber, Min, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '../entities/base-product.entity';

export class Track {
    title: string;
    length: string;
}

export class UpdateCdDto {
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
  isActive: boolean;

  @ApiProperty()
  @IsString()
  artists: string;

  @ApiProperty()
  @IsString()
  recordLabel: string;

  @ApiProperty()
  @IsString()
  tracks: Track[];

  @ApiProperty()
  @IsString()
  genre: string;

  @ApiPropertyOptional()
  releaseDate?: Date;
}
