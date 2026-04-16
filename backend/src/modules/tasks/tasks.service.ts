// ── tasks.service.ts ─────────────────────────────────────────
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskSection, AgeGroup } from './entities/tasks.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  findAll(section?: TaskSection, ageGroup?: AgeGroup): Promise<Task[]> {
    const where: Partial<Task> = { isActive: true };
    if (section) where.section = section;
    if (ageGroup) where.ageGroup = ageGroup;
    return this.taskRepo.find({
      where,
      order: { ageGroup: 'ASC', sortOrder: 'ASC' },
    });
  }

  findByAgeGroup(ageGroup: AgeGroup): Promise<Task[]> {
    return this.taskRepo.find({
      where: { ageGroup, section: 'задание', isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
