import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsInt,
  IsUUID,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEpisodeDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  programId: string;

  @ApiProperty({ example: 1, description: 'Episode number within the program' })
  @IsInt()
  @Min(1)
  episodeNumber: number;

  @ApiProperty({ example: 'Episode Title Here' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'fnjan-ep-1',
    description: 'URL-friendly identifier',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'In this episode we discuss...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumb.jpg' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/video.mp4' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/audio.mp3' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 'dQw4w9WgXcQ' })
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
