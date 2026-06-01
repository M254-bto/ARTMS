import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService, InviteTenantDto, AcceptInviteDto } from './tenants.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

  // Owner: send invite email + WhatsApp to tenant
  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_MANAGER, Role.PROPERTY_OWNER)
  @Post('invite')
  invite(@Body() dto: InviteTenantDto) { return this.service.invite(dto); }

  // Tenant: accept invite token and set password (public — no JWT needed)
  @Public()
  @Post('accept-invite')
  acceptInvite(@Body() dto: AcceptInviteDto) { return this.service.acceptInvite(dto); }

  // Register page: read invite details to pre-fill the form (public)
  @Public()
  @Get('invite-preview/:token')
  getInvitePreview(@Param('token') token: string) { return this.service.getInvitePreview(token); }

  @Get()
  findAll(@Query('propertyId') propertyId?: string) { return this.service.findAll(propertyId); }

  @Get('invites')
  findInvites(@Query('propertyId') propertyId?: string) { return this.service.findInvites(propertyId); }

  @Get('me')
  getMyProfile(@CurrentUser('id') userId: string) { return this.service.findByUserId(userId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }
}
