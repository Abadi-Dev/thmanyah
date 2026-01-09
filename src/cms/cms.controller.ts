import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProgramsService } from '../programs/programs.service';
import { CreateProgramDto, UpdateProgramDto } from '../programs/dto';
import { Program } from '../programs/entities/program.entity';

@Controller('cms/programs')
export class CmsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProgramDto): Promise<Program> {
    return this.programsService.create(dto);
  }

  @Get()
  findAll(): Promise<Program[]> {
    return this.programsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Program> {
    return this.programsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ): Promise<Program> {
    return this.programsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.programsService.remove(id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string): Promise<Program> {
    return this.programsService.publish(id);
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string): Promise<Program> {
    return this.programsService.unpublish(id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string): Promise<Program> {
    return this.programsService.archive(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string): Promise<Program> {
    return this.programsService.restore(id);
  }
}
