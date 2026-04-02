import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { RealtimeModule } from './realtime/realtime.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, WorkspacesModule, RealtimeModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
