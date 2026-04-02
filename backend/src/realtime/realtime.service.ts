import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RealtimeService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(workspaceId: number, senderId: number, content: string) {
    const msg = await this.prisma.message.create({
      data: { workspaceId, senderId, content },
      include: { sender: { select: { id: true, name: true, email: true } } },
    });
    
    await this.logActivity(workspaceId, senderId, 'message', content);
    return msg;
  }

  async getMessages(workspaceId: number) {
    return this.prisma.message.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, email: true } } },
    });
  }

  async getDocument(workspaceId: number) {
    let doc = await this.prisma.document.findUnique({
      where: { workspaceId },
    });
    if (!doc) {
      doc = await this.prisma.document.create({
        data: { workspaceId, content: '# Welcome to your Workspace\n\nStart collaborating here...' },
      });
    }
    return doc;
  }

  async saveDocument(workspaceId: number, content: string) {
    return this.prisma.document.upsert({
      where: { workspaceId },
      update: { content },
      create: { workspaceId, content },
    });
  }

  async logActivity(workspaceId: number, userId: number, type: string, content: string) {
    return this.prisma.activity.create({
      data: {
        workspaceId,
        userId,
        type,
        content,
      },
    });
  }

  async getActivities(workspaceId?: number) {
    return this.prisma.activity.findMany({
      where: workspaceId ? { workspaceId } : {},
      include: {
        user: { select: { name: true } },
        workspace: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getGlobalStats() {
    const [messages, tasks, users] = await Promise.all([
      this.prisma.message.count(),
      this.prisma.task.count({ where: { status: 'done' } }),
      this.prisma.user.count(),
    ]);
    return { messages, tasksCompleted: tasks, activeUsers: users };
  }
}
