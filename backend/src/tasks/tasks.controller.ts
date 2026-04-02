import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post(':workspaceId/create')
  async create(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() data: { title: string; assigneeId?: number },
    @Request() req,
  ) {
    return this.tasksService.create(workspaceId, data.title, req.user.id, data.assigneeId);
  }

  @Patch(':workspaceId/update/:id')
  async update(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status?: string; order?: number; assigneeId?: number },
    @Request() req,
  ) {
    return this.tasksService.updateTask(id, { ...data, workspaceId, userId: req.user.id });
  }

  @Delete(':workspaceId/delete/:id')
  async delete(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.tasksService.deleteTask(id, workspaceId, req.user.id);
  }

  @Get(':workspaceId/all')
  async getAll(@Param('workspaceId', ParseIntPipe) workspaceId: number) {
    return this.tasksService.getAllByWorkspace(workspaceId);
  }
}
