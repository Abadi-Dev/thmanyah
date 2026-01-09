import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgramType } from '../entities/program.entity';

export class CreateProgramDto {
  @ApiProperty({ example: 'The Thmanyah Show', description: 'Public title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'the-thmanyah-show',
    description: 'URL-friendly identifier',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'A deep dive into...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProgramType, example: ProgramType.PODCAST })
  @IsEnum(ProgramType)
  type: ProgramType;

  @ApiPropertyOptional({ example: 'https://random-server.com/img.jpg' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: 'dQw4w9WgXcQ',
    description: 'YouTube ID if the program is already uploaded',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  youtubeId?: string;

  @ApiPropertyOptional({ example: 3600, description: 'Duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}
