import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsNumberString } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ description: 'Search query (min 2 characters)', example: 'فنجان' })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiProperty({ description: 'Results limit', required: false, example: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
