import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AssignmentsService } from './assignments.service';

type RequestType = {
  user: {
    id: string;
  };
};

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('children/:childId/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get child's assignments (today + all unread past). Pass ?date=YYYY-MM-DD for history.",
  })
  @ApiQuery({ name: 'date', required: false, example: '2025-02-20' })
  getForChild(
    @Param('childId') childId: string,
    @Query('date') date: string | undefined,
    @Request() req: RequestType,
  ) {
    return this.assignmentsService.getForChild(childId, req.user.id, date);
  }

  @Patch(':assignmentId/complete')
  @ApiOperation({ summary: 'Mark an assignment as completed ✓' })
  complete(
    @Param('assignmentId') assignmentId: string,
    @Request() req: RequestType,
  ) {
    return this.assignmentsService.complete(assignmentId, req.user.id);
  }

  @Patch(':assignmentId/uncomplete')
  @ApiOperation({ summary: 'Unmark an assignment (remove checkmark)' })
  uncomplete(
    @Param('assignmentId') assignmentId: string,
    @Request() req: RequestType,
  ) {
    return this.assignmentsService.uncomplete(assignmentId, req.user.id);
  }
}
