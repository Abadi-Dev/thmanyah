import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from '../search/search.service';

@ApiTags('discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.trim().length < 2) {
      return { programs: [], episodes: [] };
    }

    const results = await this.searchService.searchAll(
      query.trim(),
      limit ? parseInt(limit, 10) : 10,
    );

    return results;
  }

  @Get('search/programs')
  async searchPrograms(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.trim().length < 2) {
      return { hits: [], total: 0 };
    }

    const filter = type ? `type = "${type}"` : undefined;

    return this.searchService.searchPrograms(query.trim(), {
      filter,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('search/episodes')
  async searchEpisodes(
    @Query('q') query: string,
    @Query('programId') programId?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.trim().length < 2) {
      return { hits: [], total: 0 };
    }

    const filter = programId ? `programId = "${programId}"` : undefined;

    return this.searchService.searchEpisodes(query.trim(), {
      filter,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}
