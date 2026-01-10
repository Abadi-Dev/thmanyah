import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Episode } from '../../episodes/entities/episode.entity';

export enum ProgramType {
  PODCAST = 'podcast',
  DOCUMENTARY = 'documentary',
  VIDEO = 'video',
}

export enum ProgramStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ProgramType })
  type: ProgramType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 10, default: 'ar' })
  language: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  youtubeId: string | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ type: 'enum', enum: ProgramStatus, default: ProgramStatus.DRAFT })
  status: ProgramStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Episode, (episode) => episode.program)
  episodes: Episode[];
}
