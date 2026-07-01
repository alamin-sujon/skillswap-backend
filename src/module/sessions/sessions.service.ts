// src/modules/sessions/sessions.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SessionStatus, MatchStatus } from 'prisma/generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session under an ACCEPTED match.
   * Both match participants are automatically added as SessionParticipants.
   */
  async createSession(userId: string, dto: CreateSessionDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
    });

    if (!match) throw new NotFoundException('Match not found');

    if (match.userAId !== userId && match.userBId !== userId) {
      throw new ForbiddenException('You are not part of this match');
    }

    if (match.status !== MatchStatus.ACCEPTED) {
      throw new BadRequestException(
        'Match must be accepted before scheduling a session',
      );
    }

    const session = await this.prisma.session.create({
      data: {
        matchId: dto.matchId,
        title: dto.title,
        date: new Date(dto.date),
        durationMinutes: dto.durationMinutes,
        format: dto.format,
        location: dto.location,
        meetingLink: dto.meetingLink,
        notes: dto.notes,
        status: SessionStatus.PENDING,
        participants: {
          createMany: {
            data: [{ userId: match.userAId }, { userId: match.userBId }],
            skipDuplicates: true,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        },
        skillExchanges: true,
      },
    });

    return session;
  }

  /**
   * Get all sessions the user is a participant in.
   */
  async getMySessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        match: {
          include: {
            userA: { select: { id: true, displayName: true, avatarUrl: true } },
            userB: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
        participants: {
          include: {
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
        skillExchanges: true,
        reviews: {
          select: { id: true, rating: true,  },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get a single session by ID (only if the user is a participant).
   */
  async getSessionById(userId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        match: {
          include: {
            userA: { select: { id: true, displayName: true, avatarUrl: true } },
            userB: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
        participants: {
          include: {
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
        skillExchanges: true,
        reviews: true,
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    const isParticipant = session.participants.some((p) => p.userId === userId);
    if (!isParticipant)
      throw new ForbiddenException('You are not a participant of this session');

    return session;
  }

  /**
   * Update session details (date, notes, link, etc.).
   * Only a participant can update.
   */
  async updateSession(
    userId: string,
    sessionId: string,
    dto: UpdateSessionDto,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) throw new NotFoundException('Session not found');

    const isParticipant = session.participants.some((p) => p.userId === userId);
    if (!isParticipant)
      throw new ForbiddenException('You are not a participant of this session');

    const nonEditableStatuses: SessionStatus[] = [
      SessionStatus.COMPLETED,
      SessionStatus.CANCELLED,
    ];
    if (nonEditableStatuses.includes(session.status)) {
      throw new BadRequestException(
        `Cannot edit a session that is ${session.status}`,
      );
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.durationMinutes !== undefined && {
          durationMinutes: dto.durationMinutes,
        }),
        ...(dto.format !== undefined && { format: dto.format }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.meetingLink !== undefined && { meetingLink: dto.meetingLink }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: { participants: true, skillExchanges: true },
    });
  }

  /**
   * Confirm a PENDING session (the other participant confirms).
   */
  async confirmSession(userId: string, sessionId: string) {
    return this.transitionStatus(userId, sessionId, SessionStatus.CONFIRMED, [
      SessionStatus.PENDING,
    ]);
  }

  /**
   * Mark a CONFIRMED session as IN_PROGRESS.
   */
  async startSession(userId: string, sessionId: string) {
    return this.transitionStatus(userId, sessionId, SessionStatus.IN_PROGRESS, [
      SessionStatus.CONFIRMED,
    ]);
  }

  /**
   * Mark an IN_PROGRESS session as COMPLETED.
   */
  async completeSession(userId: string, sessionId: string) {
    return this.transitionStatus(userId, sessionId, SessionStatus.COMPLETED, [
      SessionStatus.IN_PROGRESS,
    ]);
  }

  /**
   * Cancel a session (only PENDING or CONFIRMED can be cancelled).
   */
  async cancelSession(userId: string, sessionId: string) {
    return this.transitionStatus(userId, sessionId, SessionStatus.CANCELLED, [
      SessionStatus.PENDING,
      SessionStatus.CONFIRMED,
    ]);
  }

  /**
   * Decline a PENDING session.
   */
  async declineSession(userId: string, sessionId: string) {
    return this.transitionStatus(userId, sessionId, SessionStatus.DECLINED, [
      SessionStatus.PENDING,
    ]);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async transitionStatus(
    userId: string,
    sessionId: string,
    targetStatus: SessionStatus,
    allowedFrom: SessionStatus[],
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) throw new NotFoundException('Session not found');

    const isParticipant = session.participants.some((p) => p.userId === userId);
    if (!isParticipant)
      throw new ForbiddenException('You are not a participant of this session');

    if (!allowedFrom.includes(session.status)) {
      throw new BadRequestException(
        `Cannot transition to ${targetStatus} from ${session.status}`,
      );
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: targetStatus },
    });
  }
}
