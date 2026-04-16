import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChildrenService } from './children.service';
import {
  CreateChildDto,
  UpdateChildDto,
  AddMeasurementDto,
} from './dto/children.dto';

type RequestType = {
  user: {
    id: string;
  };
};

@ApiTags('Children')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  // ─── Children CRUD ───────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all children of current user' })
  findAll(@Request() req: RequestType) {
    return this.childrenService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one child by id' })
  findOne(@Param('id') id: string, @Request() req: RequestType) {
    return this.childrenService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new child' })
  create(@Body() dto: CreateChildDto, @Request() req: RequestType) {
    return this.childrenService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update child info (name, age group, etc.)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChildDto,
    @Request() req: RequestType,
  ) {
    return this.childrenService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a child' })
  remove(@Param('id') id: string, @Request() req: RequestType) {
    return this.childrenService.remove(id, req.user.id);
  }

  // ─── Measurements ────────────────────────────────────────────

  @Get(':id/measurements')
  @ApiOperation({ summary: 'Get full height/weight history for a child' })
  getMeasurements(@Param('id') id: string, @Request() req: RequestType) {
    return this.childrenService.getMeasurements(id, req.user.id);
  }

  @Post(':id/measurements')
  @ApiOperation({ summary: 'Add a new height/weight measurement snapshot' })
  addMeasurement(
    @Param('id') id: string,
    @Body() dto: AddMeasurementDto,
    @Request() req: RequestType,
  ) {
    return this.childrenService.addMeasurement(id, req.user.id, dto);
  }
}
