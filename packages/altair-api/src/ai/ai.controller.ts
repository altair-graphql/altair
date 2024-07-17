import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { SendMessageDto } from './dto/send-message.dto';
import { RateMessageDto } from './dto/rate-message.dto';

@Controller('ai')
@ApiTags('AI')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('sessions')
  async getAllSessions(@Req() req: Request) {
    const userId = req?.user?.id ?? '';
    return this.aiService.getSessions(userId);
  }

  @Post('sessions')
  async createSession(@Req() req: Request) {
    const userId = req?.user?.id ?? '';
    return this.aiService.createNewActiveSession(userId);
  }

  @Get('sessions/:id/messages')
  async getSessionMessages(@Req() req: Request, @Param('id') sessionId: string) {
    const userId = req?.user?.id ?? '';
    return this.aiService.getSessionMessages(userId, sessionId);
  }

  @Post('sessions/:id/messages')
  async sendMessage(
    @Req() req: Request,
    @Param('id') sessionId: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    const userId = req?.user?.id ?? '';
    return this.aiService.sendMessage(userId, sessionId, sendMessageDto);
  }

  @Post('sessions/:sessionId/messages/:messageId/rate')
  async rateMessage(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
    @Param('messageId') messageId: string,
    @Body() rateMessageDto: RateMessageDto
  ) {
    const userId = req?.user?.id ?? '';
    return this.aiService.rateMessage({
      userId,
      sessionId,
      messageId,
      rating: rateMessageDto.rating,
    });
  }
}
