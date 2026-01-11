import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Program } from '../programs/entities/program.entity';
import { Episode } from '../episodes/entities/episode.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Program, Episode])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
