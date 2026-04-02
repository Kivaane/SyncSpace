import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private realtimeService: RealtimeService,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtimeGateway: RealtimeGateway,
  ) {}

  async create(workspaceId: number, title: string, userId: number, assigneeId?: number) {
    // Get max order in the workspace/todo column
    const maxOrder = await this.prisma.task.aggregate({
      where: { workspaceId, status: 'todo' },
      _max: { order: true },
    });

    const task = await this.prisma.task.create({
      data: {
        workspaceId,
        title,
        assigneeId,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true } },
      },
    });

    await this.realtimeService.logActivity(workspaceId, userId, 'task_create', `Created task: ${title}`);
    this.realtimeGateway.broadcastTaskEvent(workspaceId, 'task_created', task);
    return task;
  }

  async updateTask(taskId: number, data: { status?: string; order?: number; assigneeId?: number; workspaceId: number; userId: number }) {
    const { workspaceId, userId, ...updateData } = data;
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } },
      },
    });

    await this.realtimeService.logActivity(workspaceId, userId, 'task_update', `Updated task status to [${task.status}] for: ${task.title}`);
    this.realtimeGateway.broadcastTaskEvent(workspaceId, 'task_updated', task);
    return task;
  }

  async getAllByWorkspace(workspaceId: number) {
    return this.prisma.task.findMany({
      where: { workspaceId },
      include: {
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [
        { status: 'asc' }, // todo, inprogress, done
        { order: 'asc' },
      ],
    });
  }

  async deleteTask(taskId: number, workspaceId: number, userId: number) {
    const task = await this.prisma.task.delete({
      where: { id: taskId },
    });

    await this.realtimeService.logActivity(workspaceId, userId, 'task_delete', `Deleted task: ${task.title}`);
    this.realtimeGateway.broadcastTaskEvent(workspaceId, 'task_deleted', { id: taskId });
    return { success: true };
  }
}
