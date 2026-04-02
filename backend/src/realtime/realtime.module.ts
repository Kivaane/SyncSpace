import { Module, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    forwardRef(() => TasksModule), // 🔥 IMPORTANT
  ],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}