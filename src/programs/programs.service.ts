import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Program, ProgramStatus } from './entities/program.entity';
import { Episode, EpisodeStatus } from '../episodes/entities/episode.entity';
import { CreateProgramDto, UpdateProgramDto } from './dto';
import { PaginationDto, PaginatedResult } from '../common';
import { SearchService } from '../search/search.service';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    private readonly searchService: SearchService,
  ) {}

  async create(dto: CreateProgramDto): Promise<Program> {
    const existing = await this.programRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `Program with slug '${dto.slug}' already exists`,
      );
    }

    const program = this.programRepository.create({
      ...dto,
      status: ProgramStatus.DRAFT,
    });

    const saved = await this.programRepository.save(program);

    this.searchService.indexProgram(saved);

    return saved;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Program>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.programRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id: Equal(id) },
      relations: ['episodes'],
      order: { episodes: { episodeNumber: 'ASC' } },
    });
    if (!program) {
      throw new NotFoundException(`Program with id '${id}' not found`);
    }
    return program;
  }

  async update(id: string, dto: UpdateProgramDto): Promise<Program> {
    const program = await this.findOne(id);

    if (dto.slug && dto.slug !== program.slug) {
      const existing = await this.programRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(
          `Program with slug '${dto.slug}' already exists`,
        );
      }
    }

    Object.assign(program, dto);
    const updated = await this.programRepository.save(program);

    // Sync to Meilisearch
    this.searchService.indexProgram(updated);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const program = await this.findOne(id);

    // Get all episodes before deletion (for Meilisearch cleanup)
    const episodes = await this.episodeRepository.find({
      where: { programId: Equal(id) },
    });

    // Remove program (episodes cascade deleted in DB)
    await this.programRepository.remove(program);

    // Remove program and all its episodes from Meilisearch
    this.searchService.removeProgram(id);
    for (const episode of episodes) {
      this.searchService.removeEpisode(episode.id);
    }
  }

  async publish(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.PUBLISHED;
    program.publishedAt = new Date();
    const updated = await this.programRepository.save(program);
    this.searchService.indexProgram(updated);
    return updated;
  }

  async unpublish(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.DRAFT;
    program.publishedAt = null;
    const updated = await this.programRepository.save(program);
    this.searchService.indexProgram(updated);

    // Cascade: unpublish all episodes
    await this.cascadeEpisodeStatus(id, EpisodeStatus.DRAFT);

    return updated;
  }

  async archive(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.ARCHIVED;
    const updated = await this.programRepository.save(program);
    this.searchService.indexProgram(updated);

    // Cascade: archive all episodes
    await this.cascadeEpisodeStatus(id, EpisodeStatus.ARCHIVED);

    return updated;
  }

  async restore(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.DRAFT;
    const updated = await this.programRepository.save(program);
    this.searchService.indexProgram(updated);

    // Cascade: restore all episodes to draft
    await this.cascadeEpisodeStatus(id, EpisodeStatus.DRAFT);

    return updated;
  }

  private async cascadeEpisodeStatus(
    programId: string,
    status: EpisodeStatus,
  ): Promise<void> {
    // Update all episodes in database
    await this.episodeRepository.update(
      { programId: Equal(programId) },
      {
        status,
        publishedAt: status === EpisodeStatus.PUBLISHED ? new Date() : null,
      },
    );

    // Update all episodes in Meilisearch
    const episodes = await this.episodeRepository.find({
      where: { programId: Equal(programId) },
    });
    for (const episode of episodes) {
      this.searchService.indexEpisode(episode);
    }
  }
}
