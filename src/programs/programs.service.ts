import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Program, ProgramStatus } from './entities/program.entity';
import { CreateProgramDto, UpdateProgramDto } from './dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
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

    return this.programRepository.save(program);
  }

  async findAll(): Promise<Program[]> {
    return this.programRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id: Equal(id) },
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
    return this.programRepository.save(program);
  }

  async remove(id: string): Promise<void> {
    const program = await this.findOne(id);
    await this.programRepository.remove(program);
  }

  async publish(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.PUBLISHED;
    program.publishedAt = new Date();
    return this.programRepository.save(program);
  }

  async unpublish(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.DRAFT;
    program.publishedAt = null;
    return this.programRepository.save(program);
  }

  async archive(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.ARCHIVED;
    return this.programRepository.save(program);
  }

  async restore(id: string): Promise<Program> {
    const program = await this.findOne(id);
    program.status = ProgramStatus.DRAFT;
    return this.programRepository.save(program);
  }
}
