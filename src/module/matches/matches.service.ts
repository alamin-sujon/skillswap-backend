// src/modules/matches/matches.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MatchStatus } from 'prisma/generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

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
            avatarUrl: true,
            averageRating: true,
          },
        },
        userB: {
          select: {
            id: true,
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
    });
    if (!match) throw new NotFoundException('Match not found');

    // Only the post owner (userB) should accept/reject
    if (match.userBId !== userId) {
      throw new ForbiddenException('Only the post owner can accept this match');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(`Match is already ${match.status}`);
    }

    return this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.ACCEPTED },
    });
  }

  async rejectMatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');

    if (match.userBId !== userId) {
      throw new ForbiddenException('Only the post owner can reject this match');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(`Match is already ${match.status}`);
    }

    return this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.REJECTED },
    });
  }
}
