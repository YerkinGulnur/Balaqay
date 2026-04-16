import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './entities/child.entity';
import { ChildMeasurement } from './entities/child-measurement.entity';
import {
  CreateChildDto,
  UpdateChildDto,
  AddMeasurementDto,
} from './dto/children.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(Child)
    private readonly childRepo: Repository<Child>,
    @InjectRepository(ChildMeasurement)
    private readonly measureRepo: Repository<ChildMeasurement>,
  ) {}

  // ── CRUD ─────────────────────────────────────────────────────

  async findAll(userId: string): Promise<Child[]> {
    return this.childRepo.find({
      where: { userId },
      relations: ['measurements'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Child> {
    const child = await this.childRepo.findOne({
      where: { id },
      relations: ['measurements'],
    });
    if (!child) throw new NotFoundException('Ребёнок не найден');
    if (child.userId !== userId) throw new ForbiddenException();
    return child;
  }

  async create(userId: string, dto: CreateChildDto): Promise<Child> {
    const child = this.childRepo.create({
      userId,
      name: dto.name,
      ageGroup: dto.ageGroup,
      birthDate: dto.birthDate ?? null,
      avatarColor: dto.avatarColor ?? '#FFB347',
    });
    await this.childRepo.save(child);

    // Save initial measurement if provided
    if (dto.heightCm || dto.weightKg) {
      await this.measureRepo.save(
        this.measureRepo.create({
          childId: child.id,
          heightCm: dto.heightCm ?? null,
          weightKg: dto.weightKg ?? null,
          note: 'Начальные данные',
        }),
      );
    }
    return this.findOne(child.id, userId);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateChildDto,
  ): Promise<Child> {
    const child = await this.findOne(id, userId);
    Object.assign(child, {
      name: dto.name ?? child.name,
      ageGroup: dto.ageGroup ?? child.ageGroup,
      birthDate: dto.birthDate ?? child.birthDate,
      avatarColor: dto.avatarColor ?? child.avatarColor,
    });
    await this.childRepo.save(child);

    // If height/weight provided, add a new measurement snapshot
    if (dto.heightCm !== undefined || dto.weightKg !== undefined) {
      await this.measureRepo.save(
        this.measureRepo.create({
          childId: child.id,
          heightCm: dto.heightCm ?? null,
          weightKg: dto.weightKg ?? null,
          note: 'Обновлено родителем',
        }),
      );
    }
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const child = await this.findOne(id, userId);
    await this.childRepo.remove(child);
  }

  // ── Measurements ─────────────────────────────────────────────

  async getMeasurements(
    childId: string,
    userId: string,
  ): Promise<ChildMeasurement[]> {
    await this.findOne(childId, userId); // auth check
    return this.measureRepo.find({
      where: { childId },
      order: { measuredAt: 'ASC' },
    });
  }

  async addMeasurement(
    childId: string,
    userId: string,
    dto: AddMeasurementDto,
  ): Promise<ChildMeasurement> {
    await this.findOne(childId, userId); // auth check
    const m = this.measureRepo.create({
      childId,
      heightCm: dto.heightCm ?? null,
      weightKg: dto.weightKg ?? null,
      note: dto.note ?? null,
    });
    return this.measureRepo.save(m);
  }

  async getLatestMeasurement(
    childId: string,
  ): Promise<ChildMeasurement | null> {
    return this.measureRepo.findOne({
      where: { childId },
      order: { measuredAt: 'DESC' },
    });
  }
}
