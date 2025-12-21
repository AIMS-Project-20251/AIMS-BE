import { IsString, IsNumber, Min, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Track {
    title: string;
    length: string;
}

export class CreateCdDto {
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
  type: string = 'CD';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

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
