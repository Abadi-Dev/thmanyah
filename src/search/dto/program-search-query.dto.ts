import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class ProgramSearchQueryDto {
  @ApiProperty({
    description: 'Search query (min 2 characters)',
    example: 'فنجان',
  })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiProperty({
    description: 'Filter by program type',
    required: false,
    example: 'podcast',
    enum: ['podcast', 'documentary', 'video'],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Filter by category',
    required: false,
    example: 'business',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Results limit', required: false, example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
