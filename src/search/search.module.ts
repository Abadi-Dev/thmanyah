import { Module, Global } from '@nestjs/common';
import { SearchService } from './search.service';

@Global() // Make available everywhere without importing
@Module({
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
