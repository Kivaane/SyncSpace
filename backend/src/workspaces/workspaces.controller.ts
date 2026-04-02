import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  ParseIntPipe, 
  Query 
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('workspace')
export class WorkspacesController {
  constructor(
    private workspacesService: WorkspacesService,
    private prisma: PrismaService
  ) {}

  @Post('create')
  async create(@Request() req, @Body('name') name: string) {
    return this.workspacesService.create(name, req.user.id);
  }

  @Get('all')
  async getAll() {
    return this.workspacesService.findAll();
  }

  @Get('search')
  async search(@Query('q') q: string) {
    if (!q) return { messages: [], tasks: [], users: [] };
    
    const [messages, tasks, users] = await Promise.all([
      this.prisma.message.findMany({
        where: { content: { contains: q } },
        include: { sender: { select: { name: true } } },
        take: 5
      }),
      this.prisma.task.findMany({
        where: { title: { contains: q } },
        take: 5
      }),
      this.prisma.user.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true, email: true },
        take: 5
      })
    ]);

    return { messages, tasks, users };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.findOne(id);
  }

  @Get(':id/messages')
  async getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.getMessages(id);
  }
}
