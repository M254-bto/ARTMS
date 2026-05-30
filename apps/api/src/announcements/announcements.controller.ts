import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService, CreateAnnouncementDto } from './announcements.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private service: AnnouncementsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateAnnouncementDto) {
    return this.service.create(userId, dto);
  }

  @Get('property/:propertyId')
  findByProperty(@Param('propertyId') id: string) { return this.service.findByProperty(id); }
}
