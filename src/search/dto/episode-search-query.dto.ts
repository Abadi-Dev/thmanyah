import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsOptional,
  IsNumberString,
  IsUUID,
} from 'class-validator';

export class EpisodeSearchQueryDto {
  @ApiProperty({
    description: 'Search query (min 2 characters)',
    example: 'ريادة',
  })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiProperty({
    description: 'Filter by program ID',
    required: false,
    example: 'be419a3d-cc0f-4859-a069-f857fddb2090',
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({ description: 'Results limit', required: false, example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
