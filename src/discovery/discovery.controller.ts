import { Controller, Get, Query, Param } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { PaginationDto } from '../common';
import { SlugParamDto, ProgramEpisodeParamsDto } from './dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('programs')
  async getPrograms(@Query() paginationDto: PaginationDto) {
    return this.discoveryService.getPrograms(paginationDto);
  }

  @Get('programs/:slug')
  async getProgramBySlug(@Param() params: SlugParamDto) {
    return this.discoveryService.getProgramBySlug(params.slug);
  }

  @Get('programs/:slug/episodes')
  async getProgramEpisodes(
    @Param() params: SlugParamDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.discoveryService.getProgramEpisodes(params.slug, paginationDto);
  }

  @Get('programs/:programSlug/episodes/:episodeSlug')
  async getEpisode(@Param() params: ProgramEpisodeParamsDto) {
    return this.discoveryService.getEpisodeBySlug(
      params.programSlug,
      params.episodeSlug,
    );
  }

  @Get('featured')
  async getFeatured() {
    return this.discoveryService.getFeatured();
  }
}
