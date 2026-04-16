import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { TasksService } from './tasks.service';
import { TaskSection, AgeGroup } from './entities/tasks.entity';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Get task catalogue (filterable by section and age group)',
  })
  @ApiQuery({
    name: 'section',
    required: false,
    enum: ['задание', 'питание', 'развитие'],
  })
  @ApiQuery({
    name: 'ageGroup',
    required: false,
    enum: ['0-1', '1-3', '3-6', '6-10'],
  })
  findAll(
    @Query('section') section?: TaskSection,
    @Query('ageGroup') ageGroup?: AgeGroup,
  ) {
    return this.tasksService.findAll(section, ageGroup);
  }
}
