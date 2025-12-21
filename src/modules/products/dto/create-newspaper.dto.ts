import { IsString, IsNumber, Min, IsOptional, IsObject, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewspaperDto {
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
  type: string = 'NEWSPAPER';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty()
  @IsString()
  editorInChief: string;

  @ApiProperty()
  @IsString()
  publisher: string;

  @ApiProperty()
  @IsDate()
  publicationDate: Date;

  @ApiPropertyOptional()
  @IsString()
  issueNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  publicationFrequency?: string;

  @ApiPropertyOptional()
  @IsString()
  issn?: string;

  @ApiPropertyOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ type: [String] })
  sections?: string[];
}
