import { Controller, Post, Get, Body, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('ai')
export class RecommendationController {
  constructor(
    @Inject('RECOMMENDATION_SERVICE') private readonly recommendationClient: ClientProxy,
  ) {}

  @Post('chat')
  chat(@Body() data: { userId?: string; query: string }) {
    return this.recommendationClient.send({ cmd: 'ai_chat' }, data);
  }

  /**
   * Culture-, circle- and calendar-aware discovery feed (do.md §3.5).
   * GET /ai/discovery?userId=&region=&circleId=&query=&limit=&date=
   */
  @Get('discovery')
  discovery(
    @Query('userId') userId?: string,
    @Query('region') region?: string,
    @Query('circleId') circleId?: string,
    @Query('query') query?: string,
    @Query('date') date?: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationClient.send(
      { cmd: 'get_discovery_feed' },
      { userId, region, circleId, query, date, limit: limit ? parseInt(limit, 10) : undefined },
    );
  }
}