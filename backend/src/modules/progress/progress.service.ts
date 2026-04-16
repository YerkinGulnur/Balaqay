import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyAssignment } from '../assignments/entities/daily-assignment.entity';
import { ChildMeasurement } from '../children/entities/child-measurement.entity';
import { Child } from '../children/entities/child.entity';

export interface DailyProgress {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPct: number;
}

export interface ProgressResponse {
  child: Pick<Child, 'id' | 'name' | 'ageGroup' | 'avatarColor'>;
  // Overall stats
  totalEver: number;
  completedEver: number;
  streakDays: number; // consecutive days with 100% completion
  // Per-day progress (last 30 days)
  dailyProgress: DailyProgress[];
  // Height/weight history
  measurements: Pick<
    ChildMeasurement,
    'id' | 'heightCm' | 'weightKg' | 'measuredAt' | 'note'
  >[];
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(DailyAssignment)
    private readonly assignRepo: Repository<DailyAssignment>,
    @InjectRepository(ChildMeasurement)
    private readonly measureRepo: Repository<ChildMeasurement>,
    @InjectRepository(Child)
    private readonly childRepo: Repository<Child>,
  ) {}

  async getProgress(
    childId: string,
    userId: string,
    days = 30,
  ): Promise<ProgressResponse> {
    const child = await this.childRepo.findOne({ where: { id: childId } });
    if (!child) throw new NotFoundException('Ребёнок не найден');
    if (child.userId !== userId) throw new ForbiddenException();

    // ── 1. Raw daily_assignments grouped by date ──────────────
    const rows: Array<{
      assigned_date: string;
      total_tasks: string;
      completed_tasks: string;
    }> = await this.assignRepo.query(
      `SELECT
         assigned_date::text,
         COUNT(*)                                          AS total_tasks,
         COUNT(*) FILTER (WHERE is_completed = TRUE)      AS completed_tasks
       FROM daily_assignments
       WHERE child_id = $1
         AND assigned_date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
       GROUP BY assigned_date
       ORDER BY assigned_date ASC`,
      [childId, days],
    );

    const dailyProgress: DailyProgress[] = rows.map((r) => {
      const total = parseInt(r.total_tasks, 10);
      const completed = parseInt(r.completed_tasks, 10);
      return {
        date: r.assigned_date,
        totalTasks: total,
        completedTasks: completed,
        completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    // ── 2. All-time totals ────────────────────────────────────
    const [totals] = await this.assignRepo.query<
      {
        total_ever: string;
        completed_ever: string;
      }[]
    >(
      `SELECT
         COUNT(*)                                        AS total_ever,
         COUNT(*) FILTER (WHERE is_completed = TRUE)    AS completed_ever
       FROM daily_assignments WHERE child_id = $1`,
      [childId],
    );
    const totalEver = parseInt(totals.total_ever, 10);
    const completedEver = parseInt(totals.completed_ever, 10);

    // ── 3. Streak: count consecutive fully-completed days ──────
    const streakDays = this.calcStreak(dailyProgress);

    // ── 4. Measurements (growth chart data) ───────────────────
    const measurements = await this.measureRepo.find({
      where: { childId },
      order: { measuredAt: 'ASC' },
      select: ['id', 'heightCm', 'weightKg', 'measuredAt', 'note'],
    });

    return {
      child: {
        id: child.id,
        name: child.name,
        ageGroup: child.ageGroup,
        avatarColor: child.avatarColor,
      },
      totalEver,
      completedEver,
      streakDays,
      dailyProgress,
      measurements,
    };
  }

  // Get progress for ALL children of a user (summary only)
  async getAllProgress(userId: string): Promise<ProgressResponse[]> {
    const children = await this.childRepo.find({ where: { userId } });
    return Promise.all(children.map((c) => this.getProgress(c.id, userId)));
  }

  // ── Streak calculation ────────────────────────────────────────
  private calcStreak(progress: DailyProgress[]): number {
    // Walk backwards from most recent day
    const sorted = [...progress].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const day of sorted) {
      if (day.totalTasks > 0 && day.completionPct === 100) streak++;
      else break;
    }
    return streak;
  }
}
