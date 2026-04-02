import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { InviteController } from './invite.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  providers: [WorkspacesService],
  controllers: [WorkspacesController, InviteController],
})
export class WorkspacesModule {}
