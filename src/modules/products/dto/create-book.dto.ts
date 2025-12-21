import { IsString, IsNumber, Min, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CoverType {
    PAPERBACK = 'PAPERBACK',
    HARDCOVER = 'HARDCOVER',
}

export class CreateBookDto {
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

  @ApiProperty()
  @IsString()
  type: string = 'BOOK';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty()
  @IsString()
  authors: string;

  @ApiProperty({ enum: CoverType })
  coverType: CoverType;

  @ApiProperty()
  publisher: string;

  @ApiProperty()
  publicationDate: Date;
  
  @ApiPropertyOptional()
  pages?: number;
  
  @ApiPropertyOptional()
  language?: string;

  @ApiPropertyOptional()
  genre?: string;
}
