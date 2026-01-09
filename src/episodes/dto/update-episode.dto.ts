import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEpisodeDto } from './create-episode.dto';

export class UpdateEpisodeDto extends PartialType(
  OmitType(CreateEpisodeDto, ['programId'] as const),
) {}
