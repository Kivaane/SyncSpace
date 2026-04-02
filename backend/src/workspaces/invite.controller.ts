import { Controller, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@UseGuards(JwtAuthGuard)
@Controller('workspace')
export class InviteController {
  constructor(
    private prisma: PrismaService,
    private gateway: RealtimeGateway
  ) {}

  @Post(':id/invite')
  async invite(
    @Param('id', ParseIntPipe) workspaceId: number,
    @Body() data: { email: string; role?: string },
    @Request() req
  ) {
    const invite = await this.prisma.invite.create({
      data: {
        workspaceId,
        email: data.email,
        role: data.role || 'member'
      }
    });

    // Notify activity system
    await this.prisma.activity.create({
      data: {
        workspaceId,
        userId: req.user.id,
        type: 'invite',
        content: `Invited user ${data.email} to join.`
      }
    });

    // Mock real-time user notification
    this.gateway.server.to(`workspace_${workspaceId}`).emit('notification', {
       type: 'invite',
       message: `Synchronization signal sent to ${data.email}.`
    });

    return { success: true, invite };
  }
}
