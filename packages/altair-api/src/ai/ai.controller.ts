import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { SendMessageDto } from './dto/send-message.dto';
import { RateMessageDto } from './dto/rate-message.dto';
import { RenameSessionDto } from './dto/rename-session.dto';
import { getUserId } from 'src/common/request';
import { Throttle } from '@nestjs/throttler';

@Controller('ai')
@ApiTags('AI')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('sessions/active')
  async getActiveSession(@Req() req: Request) {
    const userId = getUserId(req);
    return this.aiService.getActiveSession(userId);
  }

  @Get('sessions')
  async getAllSessions(@Req() req: Request) {
    const userId = getUserId(req);
    return this.aiService.getSessions(userId);
  }

  @Post('sessions')
  async createSession(@Req() req: Request) {
    const userId = getUserId(req);
    return this.aiService.createNewActiveSession(userId);
  }

  @Get('sessions/:id/messages')
  async getSessionMessages(@Req() req: Request, @Param('id') sessionId: string) {
    const userId = getUserId(req);
    return this.aiService.getSessionMessages(userId, sessionId);
  }

  @Post('sessions/:id/messages')
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async sendMessage(
    @Req() req: Request,
    @Param('id') sessionId: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    const userId = getUserId(req);
    return this.aiService.sendMessage(userId, sessionId, sendMessageDto);
  }

  @Post('sessions/:id/messages/stream')
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async sendMessageStream(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') sessionId: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    const userId = getUserId(req);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      for await (const event of this.aiService.sendMessageStream(
        userId,
        sessionId,
        sendMessageDto
      )) {
        const data = JSON.stringify(event);
        res.write(`data: ${data}\n\n`);
      }
    } catch (err) {
      const errorData = JSON.stringify({
        type: 'error',
        content: err instanceof Error ? err.message : 'Unknown error',
      });
      res.write(`data: ${errorData}\n\n`);
    }

    res.end();
  }

  @Patch('sessions/:id')
  async renameSession(
    @Req() req: Request,
    @Param('id') sessionId: string,
    @Body() dto: RenameSessionDto
  ) {
    const userId = getUserId(req);
    return this.aiService.renameSession(userId, sessionId, dto.title);
  }

  @Delete('sessions/:id')
  async deleteSession(@Req() req: Request, @Param('id') sessionId: string) {
    const userId = getUserId(req);
    return this.aiService.deleteSession(userId, sessionId);
  }

  @Post('sessions/:id/resume')
  async resumeSession(@Req() req: Request, @Param('id') sessionId: string) {
    const userId = getUserId(req);
    return this.aiService.resumeSession(userId, sessionId);
  }

  @Post('sessions/:sessionId/messages/:messageId/rate')
  async rateMessage(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
    @Param('messageId') messageId: string,
    @Body() rateMessageDto: RateMessageDto
  ) {
    const userId = getUserId(req);
    return this.aiService.rateMessage({
      userId,
      sessionId,
      messageId,
      rating: rateMessageDto.rating,
    });
  }
}
