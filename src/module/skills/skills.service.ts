// src/modules/skills/skills.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateManySkillPostDto, CreateSkillPostDto } from './dto/create-skill-post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSkillPostDto) {
    return this.prisma.skillPost.create({
      data: {
        ...dto,
        userId,
      },
      include: { user: { select: { displayName: true, avatarUrl: true } } },
    });
  }
  async createmany(userId: string, dtos: CreateSkillPostDto[]) {
    console.log([userId, dtos])
    const res = await  this.prisma.skillPost.createMany({
      data: dtos.map((dto) => ({
        ...dto,
        userId,
      })),
    });
    console.log({ res })
    return res
  }

  async findAll(query: any) {
    const { type, category, search, page = 1, limit = 20 } = query;

    return this.prisma.skillPost.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(type && { type }),
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { hasSome: [search] } },
          ],
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            averageRating: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyPosts(userId: string) {
    return this.prisma.skillPost.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.skillPost.findUnique({
      where: { id, deletedAt: null },
      include: { user: true },
    });
    if (!post) throw new NotFoundException('Skill post not found');
    return post;
  }

  async update(id: string, userId: string, dto: any) {
    const post = await this.findOne(id);
    if (post.userId !== userId) throw new ForbiddenException('Not your post');

    return this.prisma.skillPost.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const post = await this.findOne(id);
    if (post.userId !== userId) throw new ForbiddenException();

    return this.prisma.skillPost.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
