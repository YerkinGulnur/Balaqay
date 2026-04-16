import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { DailyAssignment } from './entities/daily-assignment.entity';
import { ChildrenService } from '../children/children.service';
import { TasksService } from '../tasks/tasks.service';
import { Child } from '../children/entities/child.entity';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    @InjectRepository(DailyAssignment)
    private readonly assignRepo: Repository<DailyAssignment>,
    private readonly childrenService: ChildrenService,
    private readonly tasksService: TasksService,
  ) {}

  // ─── Daily cron: runs at 06:00 every morning ────────────────
  // Creates 2 fresh tasks for every child across all users
  @Cron('0 6 * * *', { timeZone: 'Asia/Almaty' })
  async scheduleDailyAssignments(): Promise<void> {
    this.logger.log('⏰ Running daily assignment creation job...');
    // Get all children via raw repo query (no user filter needed here)
    const children = await this.assignRepo.manager.find(Child);
    const today = this.todayString();

    for (const child of children) {
      await this.ensureTodayAssignments(child, today);
    }
    this.logger.log(
      `✅ Daily assignments created for ${children.length} children`,
    );
  }

  // ─── Get assignments for a child (creates today's if missing) ─
  async getForChild(childId: string, userId: string, date?: string) {
    await this.childrenService.findOne(childId, userId); // ownership check

    const targetDate = date ?? this.todayString();

    // Lazy creation: if today's assignments don't exist yet, create them
    if (!date || date === this.todayString()) {
      const child = await this.assignRepo.manager.findOne(Child, {
        where: { id: childId },
      });
      if (child) await this.ensureTodayAssignments(child, targetDate);
    }

    // Return all assignments for that date AND all unread past assignments (not completed)
    const assignments = await this.assignRepo.find({
      where: [
        // Today's assignments (all)
        { childId, assignedDate: targetDate },
        // Past incomplete assignments (visible until completed)
        { childId, isCompleted: false },
      ],
      order: { assignedDate: 'DESC', createdAt: 'ASC' },
    });

    // Deduplicate by id
    const seen = new Set<string>();
    return assignments.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }

  // ─── Mark a task as complete ──────────────────────────────────
  async complete(
    assignmentId: string,
    userId: string,
  ): Promise<DailyAssignment> {
    const assignment = await this.assignRepo.findOne({
      where: { id: assignmentId },
      relations: ['child'],
    });
    if (!assignment) throw new NotFoundException('Задание не найдено');
    if (assignment.child.userId !== userId) throw new ForbiddenException();

    assignment.isCompleted = true;
    assignment.completedAt = new Date();
    return this.assignRepo.save(assignment);
  }

  // ─── Unmark complete ─────────────────────────────────────────
  async uncomplete(
    assignmentId: string,
    userId: string,
  ): Promise<DailyAssignment> {
    const assignment = await this.assignRepo.findOne({
      where: { id: assignmentId },
      relations: ['child'],
    });
    if (!assignment) throw new NotFoundException('Задание не найдено');
    if (assignment.child.userId !== userId) throw new ForbiddenException();

    assignment.isCompleted = false;
    assignment.completedAt = null;
    return this.assignRepo.save(assignment);
  }

  // ─── Helper: ensure today's assignments exist for a child ────
  private async ensureTodayAssignments(
    child: Child,
    date: string,
  ): Promise<void> {
    const existing = await this.assignRepo.count({
      where: { childId: child.id, assignedDate: date },
    });
    if (existing > 0) return; // already created

    // Get all tasks for this age group (section = 'задание')
    const tasks = await this.tasksService.findByAgeGroup(child.ageGroup);
    if (tasks.length === 0) return;

    // Determine which tasks to assign today based on day-of-year offset
    // We pick 2 tasks: slot 1 and slot 2, rotating through the pool cyclically
    const dayOfYear = this.getDayOfYear(new Date(date));
    const slot1Tasks = tasks.filter((t) => t.daySlot === 1);
    const slot2Tasks = tasks.filter((t) => t.daySlot === 2);

    const todaySlot1 =
      slot1Tasks.length > 0 ? slot1Tasks[dayOfYear % slot1Tasks.length] : null;
    const todaySlot2 =
      slot2Tasks.length > 0 ? slot2Tasks[dayOfYear % slot2Tasks.length] : null;

    const toInsert: Partial<DailyAssignment>[] = [];
    if (todaySlot1)
      toInsert.push({
        childId: child.id,
        taskId: todaySlot1.id,
        assignedDate: date,
      });
    if (todaySlot2)
      toInsert.push({
        childId: child.id,
        taskId: todaySlot2.id,
        assignedDate: date,
      });

    if (toInsert.length > 0) {
      await this.assignRepo
        .createQueryBuilder()
        .insert()
        .into(DailyAssignment)
        .values(toInsert)
        .orIgnore() // ON CONFLICT DO NOTHING
        .execute();
    }
  }

  // ─── Utils ───────────────────────────────────────────────────
  private todayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
