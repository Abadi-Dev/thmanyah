import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Episode, EpisodeStatus } from './entities/episode.entity';
import { Program } from '../programs/entities/program.entity';
import { CreateEpisodeDto, UpdateEpisodeDto, EpisodeFilterDto } from './dto';
import { PaginationDto, PaginatedResult } from '../common';
import { SearchService } from '../search/search.service';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    private readonly searchService: SearchService,
  ) {}

  async create(dto: CreateEpisodeDto): Promise<Episode> {
    // make sure the program exists first
    const program = await this.programRepository.findOne({
      where: { id: Equal(dto.programId) },
    });
    if (!program) {
      throw new NotFoundException(
        `Program with id '${dto.programId}' not found`,
      );
    }

    // Check for duplicate slug
    const existingSlug = await this.episodeRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException(
        `Episode with slug '${dto.slug}' already exists`,
      );
    }

    // Check for duplicate episode number within program
    const existingEpisode = await this.episodeRepository.findOne({
      where: {
        programId: dto.programId,
        episodeNumber: dto.episodeNumber,
      },
    });
    if (existingEpisode) {
      throw new ConflictException(
        `Episode ${dto.episodeNumber} already exists in this program`,
      );
    }

    const episode = this.episodeRepository.create({
      ...dto,
      status: EpisodeStatus.DRAFT,
    });

    const saved = await this.episodeRepository.save(episode);

    // Sync to Meilisearch
    this.searchService.indexEpisode(saved);

    return saved;
  }

  async findAll(
    filterDto: EpisodeFilterDto,
  ): Promise<PaginatedResult<Episode>> {
    const { page = 1, limit = 10, programId } = filterDto;
    const skip = (page - 1) * limit;

    const where = programId ? { programId: Equal(programId) } : {};

    const [data, total] = await this.episodeRepository.findAndCount({
      where,
      order: programId ? { episodeNumber: 'ASC' } : { createdAt: 'DESC' },
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

  async findByProgram(
    programId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Episode>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.episodeRepository.findAndCount({
      where: { programId: Equal(programId) },
      order: { episodeNumber: 'ASC' },
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

  async findOne(id: string): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({
      where: { id: Equal(id) },
      relations: ['program'],
    });
    if (!episode) {
      throw new NotFoundException(`Episode with id '${id}' not found`);
    }
    return episode;
  }

  async update(id: string, dto: UpdateEpisodeDto): Promise<Episode> {
    const episode = await this.findOne(id);

    if (dto.slug && dto.slug !== episode.slug) {
      const existing = await this.episodeRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(
          `Episode with slug '${dto.slug}' already exists`,
        );
      }
    }

    if (dto.episodeNumber && dto.episodeNumber !== episode.episodeNumber) {
      const existing = await this.episodeRepository.findOne({
        where: {
          programId: episode.programId,
          episodeNumber: dto.episodeNumber,
        },
      });
      if (existing) {
        throw new ConflictException(
          `Episode ${dto.episodeNumber} already exists in this program`,
        );
      }
    }

    Object.assign(episode, dto);
    const updated = await this.episodeRepository.save(episode);

    // Sync to Meilisearch
    this.searchService.indexEpisode(updated);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const episode = await this.findOne(id);
    await this.episodeRepository.remove(episode);

    // Remove from Meilisearch
    this.searchService.removeEpisode(id);
  }

  async publish(id: string): Promise<Episode> {
    const episode = await this.findOne(id);
    episode.status = EpisodeStatus.PUBLISHED;
    episode.publishedAt = new Date();
    const updated = await this.episodeRepository.save(episode);
    this.searchService.indexEpisode(updated);
    return updated;
  }

  async unpublish(id: string): Promise<Episode> {
    const episode = await this.findOne(id);
    episode.status = EpisodeStatus.DRAFT;
    episode.publishedAt = null;
    const updated = await this.episodeRepository.save(episode);
    this.searchService.indexEpisode(updated);
    return updated;
  }

  async archive(id: string): Promise<Episode> {
    const episode = await this.findOne(id);
    episode.status = EpisodeStatus.ARCHIVED;
    const updated = await this.episodeRepository.save(episode);
    this.searchService.indexEpisode(updated);
    return updated;
  }

  async restore(id: string): Promise<Episode> {
    const episode = await this.findOne(id);
    episode.status = EpisodeStatus.DRAFT;
    const updated = await this.episodeRepository.save(episode);
    this.searchService.indexEpisode(updated);
    return updated;
  }
}
