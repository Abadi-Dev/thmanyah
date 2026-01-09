import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Program])],
  exports: [TypeOrmModule],
})
export class ProgramsModule {}
