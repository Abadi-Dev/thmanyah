import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Program, ProgramStatus } from '../programs/entities/program.entity';
import { Episode, EpisodeStatus } from '../episodes/entities/episode.entity';
import { PaginationDto, PaginatedResult } from '../common';

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getPrograms(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Program>> {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = `discovery:programs:${page}:${limit}`;

    // Check cache first
    const cached =
      await this.cacheManager.get<PaginatedResult<Program>>(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.programRepository.findAndCount({
      where: { status: Equal(ProgramStatus.PUBLISHED) },
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });

    const result: PaginatedResult<Program> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60 * 1000);

    return result;
  }

  async getProgramBySlug(slug: string): Promise<Program> {
    const cacheKey = `discovery:program:${slug}`;

    const cached = await this.cacheManager.get<Program>(cacheKey);
    if (cached) {
      return cached;
    }

    const program = await this.programRepository.findOne({
      where: { slug, status: Equal(ProgramStatus.PUBLISHED) },
    });

    if (!program) {
      throw new NotFoundException(`Program '${slug}' not found`);
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, program, 5 * 60 * 1000);

    return program;
  }

  async getProgramEpisodes(
    slug: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Episode>> {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = `discovery:program:${slug}:episodes:${page}:${limit}`;

    const cached =
      await this.cacheManager.get<PaginatedResult<Episode>>(cacheKey);
    if (cached) {
      return cached;
    }

    // First get the program
    const program = await this.programRepository.findOne({
      where: { slug, status: Equal(ProgramStatus.PUBLISHED) },
    });

    if (!program) {
      throw new NotFoundException(`Program '${slug}' not found`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.episodeRepository.findAndCount({
      where: {
        programId: Equal(program.id),
        status: Equal(EpisodeStatus.PUBLISHED),
      },
      order: { episodeNumber: 'DESC' },
      skip,
      take: limit,
    });

    const result: PaginatedResult<Episode> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60 * 1000);

    return result;
  }

  async getEpisodeBySlug(
    programSlug: string,
    episodeSlug: string,
  ): Promise<Episode> {
    const cacheKey = `discovery:program:${programSlug}:episode:${episodeSlug}`;

    const cached = await this.cacheManager.get<Episode>(cacheKey);
    if (cached) {
      return cached;
    }

    // First get the program
    const program = await this.programRepository.findOne({
      where: { slug: programSlug, status: Equal(ProgramStatus.PUBLISHED) },
    });

    if (!program) {
      throw new NotFoundException(`Program '${programSlug}' not found`);
    }

    const episode = await this.episodeRepository.findOne({
      where: {
        slug: episodeSlug,
        programId: Equal(program.id),
        status: Equal(EpisodeStatus.PUBLISHED),
      },
    });

    if (!episode) {
      throw new NotFoundException(`Episode '${episodeSlug}' not found`);
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, episode, 5 * 60 * 1000);

    return episode;
  }

  async getFeatured(): Promise<{ programs: Program[]; episodes: Episode[] }> {
    const cacheKey = 'discovery:featured';

    const cached = await this.cacheManager.get<{
      programs: Program[];
      episodes: Episode[];
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const [programs, episodes] = await Promise.all([
      this.programRepository.find({
        where: { status: Equal(ProgramStatus.PUBLISHED) },
        order: { publishedAt: 'DESC' },
        take: 5,
      }),
      this.episodeRepository.find({
        where: { status: Equal(EpisodeStatus.PUBLISHED) },
        order: { publishedAt: 'DESC' },
        take: 10,
      }),
    ]);

    const result = { programs, episodes };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60 * 1000);

    return result;
  }
}
