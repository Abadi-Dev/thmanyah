import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SlugParamDto {
  @ApiProperty({ description: 'Program slug', example: 'fnjan' })
  @IsString()
  @IsNotEmpty()
  slug: string;
}

export class ProgramEpisodeParamsDto {
  @ApiProperty({ description: 'Program slug', example: 'fnjan' })
  @IsString()
  @IsNotEmpty()
  programSlug: string;

  @ApiProperty({ description: 'Episode slug', example: 'fnjan-ep1' })
  @IsString()
  @IsNotEmpty()
  episodeSlug: string;
}
