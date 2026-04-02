import { Controller, Get, UseGuards } from '@nestjs/common';
import { RealtimeService } from './realtime/realtime.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private realtimeService: RealtimeService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.realtimeService.getGlobalStats();
  }

  @Get('activities')
  @UseGuards(JwtAuthGuard)
  async getActivities() {
    return this.realtimeService.getActivities();
  }
}
