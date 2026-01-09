import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EpisodesService } from '../episodes/episodes.service';
import { CreateEpisodeDto, UpdateEpisodeDto, EpisodeFilterDto } from '../episodes/dto';
import { Episode } from '../episodes/entities/episode.entity';
import { PaginatedResult } from '../common';

@ApiTags('cms')
@Controller('cms/episodes')
export class CmsEpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEpisodeDto): Promise<Episode> {
    return this.episodesService.create(dto);
  }

  @Get()
  findAll(
    @Query() filterDto: EpisodeFilterDto,
  ): Promise<PaginatedResult<Episode>> {
    return this.episodesService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Episode> {
    return this.episodesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEpisodeDto,
  ): Promise<Episode> {
    return this.episodesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.episodesService.remove(id);
  }

  @Patch(':id/publish')
  publish(@Param('id', ParseUUIDPipe) id: string): Promise<Episode> {
    return this.episodesService.publish(id);
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id', ParseUUIDPipe) id: string): Promise<Episode> {
    return this.episodesService.unpublish(id);
  }

  @Patch(':id/archive')
  archive(@Param('id', ParseUUIDPipe) id: string): Promise<Episode> {
    return this.episodesService.archive(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<Episode> {
    return this.episodesService.restore(id);
  }
}
