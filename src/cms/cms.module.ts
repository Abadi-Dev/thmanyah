import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  imports: [ProgramsModule],
  controllers: [CmsController],
})
export class CmsModule {}
