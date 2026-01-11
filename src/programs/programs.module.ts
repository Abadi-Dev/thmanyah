import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Episode } from '../episodes/entities/episode.entity';
import { ProgramsService } from './programs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Episode])],
  exports: [ProgramsService],
  providers: [ProgramsService],
})
export class ProgramsModule {}
