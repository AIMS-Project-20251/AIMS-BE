import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString, Min } from "class-validator";
import { ProductType } from "../entities/base-product.entity";

export enum CoverType {
    PAPERBACK = 'PAPERBACK',
    HARDCOVER = 'HARDCOVER',
}

export class UpdateBookDto {
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