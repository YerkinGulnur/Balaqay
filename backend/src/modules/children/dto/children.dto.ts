import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AgeGroup } from '../entities/child.entity';

export class CreateChildDto {
  @ApiProperty({ example: 'Айя' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: ['0-1', '1-3', '3-6', '6-10'] })
  @IsEnum(['0-1', '1-3', '3-6', '6-10'])
  ageGroup: AgeGroup;

  @ApiPropertyOptional({ example: '2020-04-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '#FFB347' })
  @IsOptional()
  @IsString()
  avatarColor?: string;

  @ApiPropertyOptional({ example: 105.5 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({ example: 16.5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  weightKg?: number;
}

export class UpdateChildDto extends PartialType(CreateChildDto) {}

export class AddMeasurementDto {
  @ApiPropertyOptional({ example: 106 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({ example: 16.8 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  weightKg?: number;

  @ApiPropertyOptional({ example: 'Плановый осмотр педиатра' })
  @IsOptional()
  @IsString()
  note?: string;
}
