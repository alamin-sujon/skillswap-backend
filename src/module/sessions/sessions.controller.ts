// src/modules/sessions/sessions.controller.ts
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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { UpdateSessionDto } from './dto/update-session.dto';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * POST /sessions
   * Create a session under an accepted match
   */
  @Post()
  createSession(@Request() req, @Body() dto: CreateSessionDto) {
    return this.sessionsService.createSession(req.user.id, dto);
  }

  /**
   * GET /sessions
   * List all sessions the current user is participating in
   */
  @Get()
  getMySessions(@Request() req) {
    return this.sessionsService.getMySessions(req.user.id);
  }

  /**
   * GET /sessions/:id
   * Get a single session by ID
   */
  @Get(':id')
  getSessionById(@Request() req, @Param('id') sessionId: string) {
    return this.sessionsService.getSessionById(req.user.id, sessionId);
  }

  /**
   * PATCH /sessions/:id
   * Update session details (title, date, link, etc.)
   */
  @Patch(':id')
  updateSession(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.updateSession(req.user.id, sessionId, dto);
  }

  /**
   * PATCH /sessions/:id/confirm
   * Confirm a pending session
   */
  @Patch(':id/confirm')
  confirmSession(@Request() req, @Param('id') sessionId: string) {
    return this.sessionsService.confirmSession(req.user.id, sessionId);
  }

  /**
   * PATCH /sessions/:id/start
   * Mark a confirmed session as in-progress
   */
  @Patch(':id/start')
  startSession(@Request() req, @Param('id') sessionId: string) {
    return this.sessionsService.startSession(req.user.id, sessionId);
  }

  /**
   * PATCH /sessions/:id/complete
   * Mark an in-progress session as completed
   */
  @Patch(':id/complete')
  completeSession(@Request() req, @Param('id') sessionId: string) {
    return this.sessionsService.completeSession(req.user.id, sessionId);
  }

  /**
   * PATCH /sessions/:id/cancel
   * Cancel a pending or confirmed session
   */
  @Patch(':id/cancel')
  cancelSession(@Request() req, @Param('id') sessionId: string) {
    return this.sessionsService.cancelSession(req.user.id, sessionId);
  }

  /**
   * PATCH /sessions/:id/decline
   * Decline a pending session
   */
  @Patch(':id/decline')
  declineSession(@Request() req, @Param('id') sessionId: string) {
    return this.sessionsService.declineSession(req.user.id, sessionId);
  }
}
