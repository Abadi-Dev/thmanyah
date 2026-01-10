import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import {
  SearchQueryDto,
  ProgramSearchQueryDto,
  EpisodeSearchQueryDto,
} from './dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() dto: SearchQueryDto) {
    if (!dto.q || dto.q.trim().length < 2) {
      return { programs: [], episodes: [] };
    }

    return this.searchService.searchAll(
      dto.q.trim(),
      dto.limit ? parseInt(dto.limit, 10) : 10,
    );
  }

  @Get('programs')
  async searchPrograms(@Query() dto: ProgramSearchQueryDto) {
    if (!dto.q || dto.q.trim().length < 2) {
      return { hits: [], total: 0 };
    }

    const filters: string[] = [];
    if (dto.type) filters.push(`type = "${dto.type}"`);
    if (dto.category) filters.push(`category = "${dto.category}"`);

    return this.searchService.searchPrograms(dto.q.trim(), {
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
      limit: dto.limit ? parseInt(dto.limit, 10) : 20,
    });
  }

  @Get('episodes')
  async searchEpisodes(@Query() dto: EpisodeSearchQueryDto) {
    if (!dto.q || dto.q.trim().length < 2) {
      return { hits: [], total: 0 };
    }

    const filter = dto.programId ? `programId = "${dto.programId}"` : undefined;

    return this.searchService.searchEpisodes(dto.q.trim(), {
      filter,
      limit: dto.limit ? parseInt(dto.limit, 10) : 20,
    });
  }
}
