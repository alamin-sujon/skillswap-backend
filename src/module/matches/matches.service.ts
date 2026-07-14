// src/modules/matches/matches.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MatchStatus, SessionFormat, SessionStatus } from 'prisma/generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly sessionService: SessionsService,
  ) {}

  /**
   * Send a match request to the owner of a specific SkillPost.
   * userBId is derived from the post — requester doesn't pass it manually.
   */
  async createMatchRequest(userAId: string, skillPostId: string) {
    const skillPost = await this.prisma.skillPost.findUnique({
      where: { id: skillPostId },
      select: { userId: true, isActive: true, deletedAt: true },
    });

    if (!skillPost || skillPost.deletedAt || !skillPost.isActive) {
      throw new NotFoundException('Skill post not found or no longer active');
    }

    const userBId = skillPost.userId;

    if (userAId === userBId) {
      throw new BadRequestException('Cannot match with your own skill post');
    }

    return this.prisma.match.upsert({
      where: {
        userAId_userBId_skillPostId: { userAId, userBId, skillPostId },
      },
      update: {}, // already exists — return as-is
      create: {
        userAId,
        userBId,
        skillPostId,
        status: MatchStatus.PENDING,
      },
      include: {
        skillPost: {
          select: { id: true, title: true, category: true, type: true },
        },
        userB: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });
  }

  async getMyMatches(userId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: {
            id: true,
            displayName: true,
            fullName: true,
            avatarUrl: true,
            averageRating: true,
          },
        },
        userB: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatarUrl: true,
            averageRating: true,
          },
        },
        skillPost: {
          select: { id: true, title: true, category: true, type: true },
        },
        sessions: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async acceptMatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        userA: true,
        userB: true,
        skillPost: true,

      },
    });

    if (!match) throw new NotFoundException('Match not found');

    // Only the post owner (userB) should accept/reject
    if (match.userBId !== userId) {
      throw new ForbiddenException('Only the post owner can accept this match');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(`Match is already ${match.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Optional: set up session fields based on your SkillPost / business rules
      const session = await tx.session.create({
        data: {
          matchId: match.id,
          title: match.skillPost.title ?? null,
          date: new Date(), // <-- replace with your real scheduling logic
          durationMinutes: null, // <-- replace if you have it
          format: match.skillPost.preferredFormat as SessionFormat, // <-- adjust to your schema; ensure SkillPost has it
          location: null, // or match.skillPost.location
          meetingLink: null, // or match.skillPost.meetingLink

          status: SessionStatus.CONFIRMED, // uses default too if you want
          // notes: ...
          participants: {
            create: [
              {
                userId: match.userAId,
                attended: true, // default is true; you can omit this
              },
              {
                userId: match.userBId,
                attended: true,
              },
            ],
          },
        },
        include: {
          participants: true,
        },
      });

      // Update match status
      await tx.match.update({
        where: { id: matchId },
        data: { status: MatchStatus.ACCEPTED },
      });
      
      // Notification (often keep it outside the tx if you prefer,
      // but inside is fine if your notificationsService is not DB-dependent)
       await this.notificationsService.create(match.userAId, {
        title: 'Match Accepted',
        body: `${match.userB?.fullName ?? 'A user'} accepted your match request for "${match.skillPost.title}".`,
        type: 'NEW_MATCH',
        data: {
          matchId: match.id,
          skillPostId: match.skillPost.id,
          status: 'ACCEPTED',
          sessionId: session.id, // helpful for the client
        },
      });

      return session;
    });
  }

  async rejectMatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        skillPost: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.userBId !== userId) {
      throw new ForbiddenException('Only the post owner can reject this match');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(`Match is already ${match.status}`);
    }

    await this.notificationsService.create(match.userAId, {
      title: 'Match Rejected',
      body: `Your match request for "${match.skillPost.title}" has been rejected.`,
      type: 'MATCH_REJECTED',
      data: {
        matchId: match.id,
        skillPostId: match.skillPost.id,
        status: 'REJECTED',
      },
    });

    return this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.REJECTED },
    });
  }
}
