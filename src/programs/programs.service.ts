import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, ProgramStatus } from './entities/program.entity';
import { CreateProgramDto } from './dto';

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
    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Program with id '${id}' not found`);
    }
    return program;
  }
}
