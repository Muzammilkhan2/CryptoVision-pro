import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfile } from '@cryptovision/shared-types';

@ApiTags('Price Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user price and volume alerts' })
  getUserAlerts(@CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.alertsService.getUserAlerts(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new price or volume trigger alert' })
  createAlert(@Body() dto: CreateAlertDto, @CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.alertsService.createAlert(userId, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle alert active status' })
  toggleAlert(@Param('id') id: string, @CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.alertsService.toggleAlert(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  deleteAlert(@Param('id') id: string, @CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.alertsService.deleteAlert(userId, id);
  }
}
