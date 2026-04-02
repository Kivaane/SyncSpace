import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, userId: number) {
    return this.prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true } } } }
      }
    });
  }

  async findAll() {
    return this.prisma.workspace.findMany({
      include: {
        members: { include: { user: { select: { id: true, name: true } } } }
      }
    });
  }

  async findOne(id: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true } } } },
        owner: { select: { id: true, name: true } }
      }
    });
    if (!workspace) throw new NotFoundException('SyncNode not found');
    return workspace;
  }

  async getMessages(workspaceId: number) {
    return this.prisma.message.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true } } }
    });
  }

  async join(workspaceId: number, userId: number) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');

    const existingMember = await this.prisma.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (existingMember) throw new BadRequestException('Already a member');

    return this.prisma.member.create({
      data: {
        userId,
        workspaceId,
        role: 'member',
      },
      include: {
        workspace: true
      }
    });
  }
}
