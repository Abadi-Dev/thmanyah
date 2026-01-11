import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeiliSearch, Index } from 'meilisearch';
import { Program } from '../programs/entities/program.entity';
import { Episode } from '../episodes/entities/episode.entity';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;
  private programsIndex: Index;
  private episodesIndex: Index;

  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
  ) {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    });
  }

  async onModuleInit() {
    await this.setupIndexes();
    // Auto-reindex on startup to sync with database
    await this.reindexAll();
  }

  private async setupIndexes() {
    try {
      // create indexes for the search engine
      await this.client.createIndex('programs', { primaryKey: 'id' });
      await this.client.createIndex('episodes', { primaryKey: 'id' });

      this.programsIndex = this.client.index('programs');
      this.episodesIndex = this.client.index('episodes');

      // what should be searchable
      await this.programsIndex.updateSearchableAttributes([
        'title',
        'description',
        'slug',
      ]);

      await this.episodesIndex.updateSearchableAttributes([
        'title',
        'description',
        'slug',
      ]);

      // filters
      await this.programsIndex.updateFilterableAttributes([
        'type',
        'status',
        'category',
        'language',
      ]);

      await this.episodesIndex.updateFilterableAttributes([
        'programId',
        'status',
      ]);

      this.logger.log('Meilisearch indexes configured successfully');
    } catch (error) {
      this.logger.error('Failed to setup Meilisearch indexes', error);
    }
  }

  // index one program
  async indexProgram(program: Program): Promise<void> {
    try {
      await this.programsIndex.addDocuments([this.transformProgram(program)]);
      this.logger.debug(`Indexed program: ${program.id}`);
    } catch (error) {
      this.logger.error(`Failed to index program ${program.id}`, error);
    }
  }

  // index multiple programs
  async indexPrograms(programs: Program[]): Promise<void> {
    try {
      const documents = programs.map((p) => this.transformProgram(p));
      await this.programsIndex.addDocuments(documents);
      this.logger.debug(`Indexed ${programs.length} programs`);
    } catch (error) {
      this.logger.error('Failed to index programs', error);
    }
  }

  async removeProgram(id: string): Promise<void> {
    try {
      await this.programsIndex.deleteDocument(id);
      this.logger.debug(`Removed program from index: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to remove program ${id}`, error);
    }
  }

  async indexEpisode(episode: Episode): Promise<void> {
    try {
      await this.episodesIndex.addDocuments([this.transformEpisode(episode)]);
      this.logger.debug(`Indexed episode: ${episode.id}`);
    } catch (error) {
      this.logger.error(`Failed to index episode ${episode.id}`, error);
    }
  }

  async indexEpisodes(episodes: Episode[]): Promise<void> {
    try {
      const documents = episodes.map((e) => this.transformEpisode(e));
      await this.episodesIndex.addDocuments(documents);
      this.logger.debug(`Indexed ${episodes.length} episodes`);
    } catch (error) {
      this.logger.error('Failed to index episodes', error);
    }
  }

  async removeEpisode(id: string): Promise<void> {
    try {
      await this.episodesIndex.deleteDocument(id);
      this.logger.debug(`Removed episode from index: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to remove episode ${id}`, error);
    }
  }

  // Search programs
  async searchPrograms(
    query: string,
    options?: { filter?: string; limit?: number },
  ) {
    const results = await this.programsIndex.search(query, {
      filter: options?.filter,
      limit: options?.limit || 20,
    });
    return results;
  }

  // Search episodes
  async searchEpisodes(
    query: string,
    options?: { filter?: string; limit?: number },
  ) {
    const results = await this.episodesIndex.search(query, {
      filter: options?.filter,
      limit: options?.limit || 20,
    });
    return results;
  }

  // Search both programs and episodes
  async searchAll(query: string, limit = 10) {
    const [programs, episodes] = await Promise.all([
      this.searchPrograms(query, { limit }),
      this.searchEpisodes(query, { limit }),
    ]);

    return {
      programs: programs.hits,
      episodes: episodes.hits,
    };
  }

  // Transform program for indexing (only searchable fields)
  private transformProgram(program: Program) {
    return {
      id: program.id,
      title: program.title,
      slug: program.slug,
      description: program.description,
      type: program.type,
      category: program.category,
      language: program.language,
      status: program.status,
      thumbnailUrl: program.thumbnailUrl,
    };
  }

  // Transform episode for indexing
  private transformEpisode(episode: Episode) {
    return {
      id: episode.id,
      programId: episode.programId,
      title: episode.title,
      slug: episode.slug,
      description: episode.description,
      episodeNumber: episode.episodeNumber,
      status: episode.status,
      thumbnailUrl: episode.thumbnailUrl,
    };
  }

  // Reindex all data from database
  async reindexAll(): Promise<{ programs: number; episodes: number }> {
    this.logger.log('Starting full reindex...');

    // Clear existing indexes
    await this.programsIndex.deleteAllDocuments();
    await this.episodesIndex.deleteAllDocuments();

    // Fetch all from database
    const programs = await this.programRepository.find();
    const episodes = await this.episodeRepository.find();

    // Index all
    if (programs.length > 0) {
      await this.indexPrograms(programs);
    }
    if (episodes.length > 0) {
      await this.indexEpisodes(episodes);
    }

    this.logger.log(
      `Reindex complete: ${programs.length} programs, ${episodes.length} episodes`,
    );

    return { programs: programs.length, episodes: episodes.length };
  }
}
