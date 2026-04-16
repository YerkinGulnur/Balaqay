import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Child } from './child.entity';

@Entity('child_measurements')
export class ChildMeasurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'child_id' })
  childId: string;

  @ManyToOne(() => Child, (c) => c.measurements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column({
    name: 'height_cm',
    type: 'decimal',
    precision: 5,
    scale: 1,
    nullable: true,
  })
  heightCm: number | null;

  @Column({
    name: 'weight_kg',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  weightKg: number | null;

  @CreateDateColumn({ name: 'measured_at' })
  measuredAt: Date;

  @Column({ type: 'text', nullable: true })
  note: string | null;
}
