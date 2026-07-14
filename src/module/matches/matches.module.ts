// src/modules/matches/matches.module.ts
import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
  imports: [NotificationsModule, SessionsModule]
})
export class MatchesModule {}
