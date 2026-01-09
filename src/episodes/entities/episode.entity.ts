import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Program } from '../../programs/entities/program.entity';

export enum EpisodeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('episodes')
@Index(['programId', 'episodeNumber'], { unique: true })
export class Episode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, (program) => program.episodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column({ type: 'int' })
  episodeNumber: number;

  @Column({ type: 'int', nullable: true })
  seasonNumber: number | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  audioUrl: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  youtubeId: string | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ type: 'enum', enum: EpisodeStatus, default: EpisodeStatus.DRAFT })
  status: EpisodeStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
