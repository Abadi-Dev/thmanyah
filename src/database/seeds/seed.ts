import { DataSource } from 'typeorm';
import {
  Program,
  ProgramStatus,
  ProgramType,
} from '../../programs/entities/program.entity';
import { Episode, EpisodeStatus } from '../../episodes/entities/episode.entity';
import * as path from 'path';
import * as fs from 'fs';

interface ProgramSeed {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  language: string;
  thumbnailUrl: string | null;
  youtubeId: string | null;
  status: string;
}

interface EpisodeSeed {
  id: string;
  programId: string;
  episodeNumber: number;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  youtubeId: string | null;
  duration: number | null;
  status: string;
}

async function seed() {
  console.log('Starting database seed...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'thmanyah_user',
    password: process.env.DB_PASSWORD || 'thmanyah_password',
    database: process.env.DB_NAME || 'thmanyah_cms',
    entities: [Program, Episode],
    synchronize: true, // Create tables if they don't exist
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database\n');

    const programRepo = dataSource.getRepository(Program);
    const episodeRepo = dataSource.getRepository(Episode);

    // Load seed data
    const seedsPath = path.join(__dirname);
    const programsData: ProgramSeed[] = JSON.parse(
      fs.readFileSync(path.join(seedsPath, 'programs.json'), 'utf-8'),
    );
    const episodesData: EpisodeSeed[] = JSON.parse(
      fs.readFileSync(path.join(seedsPath, 'episodes.json'), 'utf-8'),
    );

    console.log(
      `Found ${programsData.length} programs and ${episodesData.length} episodes\n`,
    );

    // Clear existing data (if tables exist)
    console.log('Clearing existing data...');
    try {
      await episodeRepo.createQueryBuilder().delete().from(Episode).execute();
      await programRepo.createQueryBuilder().delete().from(Program).execute();
      console.log('Cleared existing data\n');
    } catch {
      console.log('Tables are empty or just created\n');
    }

    // Insert programs
    console.log('Inserting programs...');
    for (const programData of programsData) {
      const program = programRepo.create({
        id: programData.id,
        slug: programData.slug,
        title: programData.title,
        description: programData.description,
        type: programData.type as ProgramType,
        category: programData.category,
        language: programData.language,
        thumbnailUrl: programData.thumbnailUrl,
        youtubeId: programData.youtubeId,
        status: ProgramStatus.PUBLISHED,
        publishedAt: new Date(),
      });
      await programRepo.save(program);
      console.log(`  + ${program.title}`);
    }
    console.log(`Inserted ${programsData.length} programs\n`);

    // Insert episodes
    console.log('Inserting episodes...');
    let count = 0;
    for (const episodeData of episodesData) {
      const episode = episodeRepo.create({
        id: episodeData.id,
        programId: episodeData.programId,
        episodeNumber: episodeData.episodeNumber,
        slug: episodeData.slug,
        title: episodeData.title,
        description: episodeData.description,
        thumbnailUrl: episodeData.thumbnailUrl,
        videoUrl: episodeData.videoUrl,
        youtubeId: episodeData.youtubeId,
        duration: episodeData.duration,
        status: EpisodeStatus.PUBLISHED,
        publishedAt: new Date(),
      });
      await episodeRepo.save(episode);
      count++;
      if (count % 25 === 0) {
        console.log(`  Inserted ${count}/${episodesData.length} episodes...`);
      }
    }
    console.log(`Inserted ${episodesData.length} episodes\n`);

    console.log('Seed completed successfully!');
    console.log('\nNote: Restart the app to sync data with Meilisearch.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seed();
