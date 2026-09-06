import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWatchlistDto {
  @ApiProperty({ example: 'DeFi & Layer 1s' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: ['BTC', 'ETH', 'SOL'], required: false })
  @IsArray()
  @IsOptional()
  symbols?: string[];
}

export class AddSymbolDto {
  @ApiProperty({ example: 'AVAX' })
  @IsString()
  @IsNotEmpty()
  symbol: string;
}
