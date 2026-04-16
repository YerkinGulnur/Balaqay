import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { DailyAssignment } from '../assignments/entities/daily-assignment.entity';
import { ChildMeasurement } from '../children/entities/child-measurement.entity';
import { Child } from '../children/entities/child.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyAssignment, ChildMeasurement, Child]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
