import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entity';
import { Program } from '../programs/entities/program.entity';
import { EpisodesService } from './episodes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Episode, Program])],
  exports: [EpisodesService],
  providers: [EpisodesService],
})
export class EpisodesModule {}
