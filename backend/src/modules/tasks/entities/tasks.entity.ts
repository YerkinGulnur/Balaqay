import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type TaskType = 'игровое' | 'двигательное' | 'речевое' | 'когнитивное';
export type TaskSection = 'задание' | 'питание' | 'развитие';
export type AgeGroup = '0-1' | '1-3' | '3-6' | '6-10';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 10 })
  emoji: string;

  @Column({
    type: 'enum',
    enum: ['игровое', 'двигательное', 'речевое', 'когнитивное'],
  })
  type: TaskType;

  @Column({
    type: 'enum',
    enum: ['задание', 'питание', 'развитие'],
    default: 'задание',
  })
  section: TaskSection;

  @Column({
    name: 'age_group',
    type: 'enum',
    enum: ['0-1', '1-3', '3-6', '6-10'],
  })
  ageGroup: AgeGroup;

  @Column({ name: 'day_slot', type: 'smallint', default: 1 })
  daySlot: number; // 1 or 2 — morning / afternoon slot

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
