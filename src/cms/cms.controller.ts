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
import { ProgramsService } from '../programs/programs.service';
import { EpisodesService } from '../episodes/episodes.service';
import { CreateProgramDto, UpdateProgramDto } from '../programs/dto';
import { Program } from '../programs/entities/program.entity';
import { Episode } from '../episodes/entities/episode.entity';
import { PaginationDto, PaginatedResult } from '../common';

@ApiTags('cms')
@Controller('cms/programs')
export class CmsController {
  constructor(
    private readonly programsService: ProgramsService,
    private readonly episodesService: EpisodesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProgramDto): Promise<Program> {
    return this.programsService.create(dto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Program>> {
    return this.programsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Program> {
    return this.programsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgramDto,
  ): Promise<Program> {
    return this.programsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.programsService.remove(id);
  }

  @Patch(':id/publish')
  publish(@Param('id', ParseUUIDPipe) id: string): Promise<Program> {
    return this.programsService.publish(id);
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id', ParseUUIDPipe) id: string): Promise<Program> {
    return this.programsService.unpublish(id);
  }

  @Patch(':id/archive')
  archive(@Param('id', ParseUUIDPipe) id: string): Promise<Program> {
    return this.programsService.archive(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<Program> {
    return this.programsService.restore(id);
  }

  @Get(':id/episodes')
  findEpisodes(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Episode>> {
    return this.episodesService.findByProgram(id, paginationDto);
  }
}
