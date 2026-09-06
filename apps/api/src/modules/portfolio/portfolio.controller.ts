import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfile } from '@cryptovision/shared-types';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user portfolio metrics, positions, and live P&L' })
  getPortfolio(@CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.portfolioService.getPortfolio(userId);
  }

  @Post('positions')
  @ApiOperation({ summary: 'Add a new asset position to the portfolio' })
  addPosition(@Body() dto: CreatePositionDto, @CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.portfolioService.addPosition(userId, dto);
  }

  @Delete('positions/:id')
  @ApiOperation({ summary: 'Remove a position from the portfolio' })
  removePosition(@Param('id') id: string, @CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.portfolioService.removePosition(userId, id);
  }
}
