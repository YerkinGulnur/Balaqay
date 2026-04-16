import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ChildMeasurement } from './child-measurement.entity';
import { DailyAssignment } from '../../assignments/entities/daily-assignment.entity';

export type AgeGroup = '0-1' | '1-3' | '3-6' | '6-10';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u: User) => u.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string | null;

  @Column({
    name: 'age_group',
    type: 'enum',
    enum: ['0-1', '1-3', '3-6', '6-10'],
  })
  ageGroup: AgeGroup;

  @Column({ name: 'avatar_color', length: 20, default: '#FFB347' })
  avatarColor: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ChildMeasurement, (m) => m.child, { cascade: true })
  measurements: ChildMeasurement[];

  @OneToMany(() => DailyAssignment, (a) => a.child)
  assignments: DailyAssignment[];
}
