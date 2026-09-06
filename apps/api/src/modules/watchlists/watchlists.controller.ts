import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WatchlistsService } from './watchlists.service';
import { CreateWatchlistDto, AddSymbolDto } from './dto/create-watchlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfile } from '@cryptovision/shared-types';

@ApiTags('Watchlists')
@Controller('watchlists')
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user watchlists' })
  getUserWatchlists(@CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.watchlistsService.getUserWatchlists(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new watchlist' })
  createWatchlist(@Body() dto: CreateWatchlistDto, @CurrentUser() user?: UserProfile) {
    const userId = user?.id || 'usr_dev_default';
    return this.watchlistsService.createWatchlist(userId, dto);
  }

  @Post(':id/symbols')
  @ApiOperation({ summary: 'Add a token symbol to watchlist' })
  addSymbol(
    @Param('id') id: string,
    @Body() dto: AddSymbolDto,
    @CurrentUser() user?: UserProfile,
  ) {
    const userId = user?.id || 'usr_dev_default';
    return this.watchlistsService.addSymbol(userId, id, dto);
  }

  @Delete(':id/symbols/:symbol')
  @ApiOperation({ summary: 'Remove a token symbol from watchlist' })
  removeSymbol(
    @Param('id') id: string,
    @Param('symbol') symbol: string,
    @CurrentUser() user?: UserProfile,
  ) {
    const userId = user?.id || 'usr_dev_default';
    return this.watchlistsService.removeSymbol(userId, id, symbol);
  }
}
