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
import { ProgramType } from '../entities/program.entity';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase with hyphens only (e.g., "my-program")',
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProgramType)
  type: ProgramType;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  youtubeId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}
