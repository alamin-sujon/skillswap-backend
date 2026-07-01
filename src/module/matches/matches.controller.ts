// src/modules/matches/matches.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchRequestDto } from './dto/create-match-request.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * POST /matches
   * Body: { skillPostId }
   * Sends a match request to the owner of the given SkillPost
   */
  @Post()
  createMatchRequest(@Request() req, @Body() dto: CreateMatchRequestDto) {
    return this.matchesService.createMatchRequest(req.user.id, dto.skillPostId);
  }

  /**
   * GET /matches
   */
  @Get()
  getMyMatches(@Request() req) {
    return this.matchesService.getMyMatches(req.user.id);
  }

  /**
   * PATCH /matches/:id/accept
   * Only the post owner (userB) can accept
   */
  @Patch(':id/accept')
  acceptMatch(@Request() req, @Param('id') matchId: string) {
    return this.matchesService.acceptMatch(req.user.id, matchId);
  }

  /**
   * PATCH /matches/:id/reject
   * Only the post owner (userB) can reject
   */
  @Patch(':id/reject')
  rejectMatch(@Request() req, @Param('id') matchId: string) {
    return this.matchesService.rejectMatch(req.user.id, matchId);
  }
}
