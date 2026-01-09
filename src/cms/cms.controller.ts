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

@Controller('cms/programs')
export class CmsController {
  // Create a new program (starts as draft)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: any) {
    return {
      id: 'uuid-placeholder',
      ...body,
      status: 'draft',
      createdAt: new Date(),
    };
  }

  @Get()
  findAll() {
    return [
      { id: '1', title: 'فنجان', status: 'published' },
      { id: '2', title: 'سوالف بزنس', status: 'draft' },
    ];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id, title: 'فنجان', status: 'draft' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return { id, ...body, updatedAt: new Date() };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return id;
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return { id, status: 'published', publishedAt: new Date() };
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return { id, status: 'draft', publishedAt: null };
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return { id, status: 'archived' };
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return { id, status: 'draft' };
  }
}
