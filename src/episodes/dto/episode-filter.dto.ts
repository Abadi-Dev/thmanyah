import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common';

export class EpisodeFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by program ID' })
  @IsOptional()
  @IsUUID()
  programId?: string;
}
