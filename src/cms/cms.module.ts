import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsEpisodesController } from './cms-episodes.controller';
import { ProgramsModule } from '../programs/programs.module';
import { EpisodesModule } from '../episodes/episodes.module';

@Module({
  imports: [ProgramsModule, EpisodesModule],
  controllers: [CmsController, CmsEpisodesController],
})
export class CmsModule {}
