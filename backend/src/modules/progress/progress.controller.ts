// ── progress.controller.ts ────────────────────────────────────
import {
  Controller,
  Get,
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
import { ProgressService } from './progress.service';

type RequestType = {
  user: {
    id: string;
  };
};

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({
    summary: 'Get progress summary for ALL children of current user',
  })
  getAllProgress(@Request() req: RequestType) {
    return this.progressService.getAllProgress(req.user.id);
  }

  @Get('children/:childId')
  @ApiOperation({
    summary:
      'Get detailed progress for one child (measurements + daily task history)',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of past days to include (default: 30)',
  })
  getProgress(
    @Param('childId') childId: string,
    @Query('days') days: string | undefined,
    @Request() req: RequestType,
  ) {
    return this.progressService.getProgress(
      childId,
      req.user.id,
      days ? parseInt(days, 10) : 30,
    );
  }
}
