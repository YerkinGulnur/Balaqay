import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Child } from '../../children/entities/child.entity';
import { Task } from '../../tasks/entities/tasks.entity';

@Entity('daily_assignments')
@Unique(['childId', 'taskId', 'assignedDate'])
export class DailyAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'child_id' })
  childId: string;

  @ManyToOne(() => Child, (c: Child) => c.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => Task, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'assigned_date', type: 'date' })
  assignedDate: string; // 'YYYY-MM-DD'

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
