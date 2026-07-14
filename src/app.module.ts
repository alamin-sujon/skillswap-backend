// AppModule
import { Module } from '@nestjs/common';

import { AuthModule } from './module/auth/auth.module';
import { PrismaModule } from './module/prisma/prisma.module';
import { SeederService } from './seed/seed.service';
import { TwilioModule } from './module/twilio/twilio.module';
import { MailModule } from './module/mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { StripeModule } from './module/stripe/stripe.module';
import { UsersModule } from './module/users/users.module';
import { SkillsModule } from './module/skills/skills.module';
import { SessionsModule } from './module/sessions/sessions.module';
import { MatchesModule } from './module/matches/matches.module';
import { MessagesModule } from './module/massages/massages.module';
// import { MassagesModule } from './module/massages/massages.module';
import { NotificationsModule } from './module/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
      envFilePath: '.env', // Ensure this points to your file
    }),
    AuthModule,
    PrismaModule,
    TwilioModule,
    MailModule,
    ScheduleModule.forRoot(),
    StripeModule,
    UsersModule,
    SkillsModule,
    SessionsModule,
    MatchesModule,
    MessagesModule,
    NotificationsModule
  ],
  providers: [SeederService],
})
export class AppModule {}
